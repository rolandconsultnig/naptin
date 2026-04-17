import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'

const router = Router()

// ─── Vendors ────────────────────────────────────────────────────

router.get('/vendors', async (req, res, next) => {
  try {
    const search = (req.query.search || '').trim()
    const status = (req.query.status || '').trim()
    const conditions = []
    const params = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(v.name ILIKE $${params.length} OR v.vendor_code ILIKE $${params.length})`)
    }
    if (status && status !== 'all') {
      params.push(status)
      conditions.push(`v.status = $${params.length}`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const rows = await query(
      `SELECT v.*,
              (SELECT COUNT(*) FROM proc_purchase_orders po WHERE po.vendor_id = v.id) AS po_count
       FROM proc_vendors v ${where} ORDER BY v.name`,
      params
    )

    res.json(rows.map(r => ({
      id: r.id, vendorCode: r.vendor_code, name: r.name,
      contactPerson: r.contact_person, email: r.email,
      phone: r.phone, address: r.address,
      registrationType: r.registration_type,
      taxId: r.tax_id, bankName: r.bank_name,
      bankAccountNo: r.bank_account_no,
      performanceRating: r.performance_rating ? parseFloat(r.performance_rating) : null,
      status: r.status, poCount: parseInt(r.po_count),
    })))
  } catch (e) { next(e) }
})

router.post('/vendors', async (req, res, next) => {
  try {
    const data = z.object({
      name: z.string().min(2),
      contactPerson: z.string().optional().default(''),
      email: z.string().email().optional().nullable(),
      phone: z.string().optional().nullable(),
      address: z.string().optional().default(''),
      registrationType: z.string().optional().nullable(),
      taxId: z.string().optional().nullable(),
      bankName: z.string().optional().nullable(),
      bankAccountNo: z.string().optional().nullable(),
    }).parse(req.body)

    const seq = Date.now().toString(36).toUpperCase().slice(-6)
    const code = `VND-${seq}`

    const [row] = await query(
      `INSERT INTO proc_vendors
        (vendor_code, name, contact_person, email, phone, address,
         registration_type, tax_id, bank_name, bank_account_no)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [code, data.name, data.contactPerson, data.email, data.phone,
       data.address, data.registrationType, data.taxId,
       data.bankName, data.bankAccountNo]
    )
    res.status(201).json({ id: row.id, vendorCode: row.vendor_code })
  } catch (e) { next(e) }
})

router.patch('/vendors/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const fields = ['name', 'contact_person', 'email', 'phone', 'address',
                     'registration_type', 'tax_id', 'bank_name', 'bank_account_no', 'status']
    const bodyMap = {
      name: 'name', contactPerson: 'contact_person', email: 'email',
      phone: 'phone', address: 'address', registrationType: 'registration_type',
      taxId: 'tax_id', bankName: 'bank_name', bankAccountNo: 'bank_account_no',
      status: 'status',
    }

    const sets = []
    const params = []
    for (const [jsKey, dbCol] of Object.entries(bodyMap)) {
      if (req.body[jsKey] !== undefined) {
        params.push(req.body[jsKey])
        sets.push(`${dbCol} = $${params.length}`)
      }
    }
    if (!sets.length) return res.status(400).json({ error: 'Nothing to update' })

    params.push(id)
    const [row] = await query(
      `UPDATE proc_vendors SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${params.length} RETURNING *`,
      params
    )
    if (!row) return res.status(404).json({ error: 'Vendor not found' })
    res.json({ id: row.id, vendorCode: row.vendor_code, name: row.name })
  } catch (e) { next(e) }
})

// ─── Purchase Requisitions ──────────────────────────────────────

router.get('/requisitions', async (req, res, next) => {
  try {
    const status = (req.query.status || '').trim()
    const cond = status && status !== 'all' ? `WHERE pr.status = $1` : ''
    const params = status && status !== 'all' ? [status] : []

    const rows = await query(
      `SELECT pr.*
       FROM proc_purchase_requisitions pr
       ${cond}
       ORDER BY pr.created_at DESC`,
      params
    )

    const result = []
    for (const r of rows) {
      const items = await query(
        `SELECT * FROM proc_pr_items WHERE requisition_id = $1 ORDER BY item_no`,
        [r.id]
      )
      result.push({
        id: r.id, prNumber: r.pr_number, title: r.title,
        requestedBy: r.requested_by, department: r.department,
        priority: r.priority, requiredDate: r.required_date,
        justification: r.justification, status: r.status,
        totalEstimated: items.reduce((s, i) => s + parseFloat(i.estimated_total), 0),
        items: items.map(i => ({
          id: i.id, itemNo: i.item_no, description: i.description,
          unit: i.unit, quantity: parseInt(i.quantity),
          estimatedPrice: parseFloat(i.estimated_unit_price),
          estimatedTotal: parseFloat(i.estimated_total),
          specs: i.specifications,
        })),
        createdAt: r.created_at,
      })
    }

    res.json(result)
  } catch (e) { next(e) }
})

router.post('/requisitions', async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().min(2),
      requestedBy: z.string(),
      department: z.string(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
      requiredDate: z.string(),
      justification: z.string().optional().default(''),
      items: z.array(z.object({
        description: z.string().min(1),
        unit: z.string().default('units'),
        quantity: z.number().int().min(1),
        estimatedUnitPrice: z.number().min(0),
        specifications: z.string().optional().default(''),
      })).min(1),
    }).parse(req.body)

    const result = await withTx(async (client) => {
      const seq = Date.now().toString(36).toUpperCase()
      const prNumber = `PR-${new Date().getFullYear()}-${seq}`

      const { rows: [pr] } = await client.query(
        `INSERT INTO proc_purchase_requisitions
          (pr_number, title, requested_by, department, priority, required_date, justification)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [prNumber, data.title, data.requestedBy, data.department,
         data.priority, data.requiredDate, data.justification]
      )

      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i]
        const total = item.quantity * item.estimatedUnitPrice
        await client.query(
          `INSERT INTO proc_pr_items
            (requisition_id, item_no, description, unit, quantity,
             estimated_unit_price, estimated_total, specifications)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [pr.id, i + 1, item.description, item.unit, item.quantity,
           item.estimatedUnitPrice, total, item.specifications]
        )
      }

      return { id: pr.id, prNumber: pr.pr_number }
    })

    res.status(201).json(result)
  } catch (e) { next(e) }
})

router.post('/requisitions/:id/approve', async (req, res, next) => {
  try {
    const [row] = await query(
      `UPDATE proc_purchase_requisitions
       SET status = 'approved', approved_by = $1, approved_at = NOW()
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [req.body.approvedBy || 'system', req.params.id]
    )
    if (!row) return res.status(400).json({ error: 'PR not in pending state' })
    res.json({ id: row.id, status: row.status })
  } catch (e) { next(e) }
})

router.post('/requisitions/:id/reject', async (req, res, next) => {
  try {
    const [row] = await query(
      `UPDATE proc_purchase_requisitions
       SET status = 'rejected'
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [req.params.id]
    )
    if (!row) return res.status(400).json({ error: 'PR not in pending state' })
    res.json({ id: row.id, status: row.status })
  } catch (e) { next(e) }
})

// ─── Tenders ────────────────────────────────────────────────────

router.get('/tenders', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT t.*,
              (SELECT COUNT(*) FROM proc_tender_bids b WHERE b.tender_id = t.id) AS bid_count
       FROM proc_tenders t
       ORDER BY t.publish_date DESC`
    )
    res.json(rows.map(r => ({
      id: r.id, tenderRef: r.tender_ref, title: r.title,
      category: r.category, publishDate: r.publish_date,
      closingDate: r.closing_date, estimatedValue: parseFloat(r.estimated_value),
      status: r.status, bidCount: parseInt(r.bid_count),
      description: r.description,
    })))
  } catch (e) { next(e) }
})

router.post('/tenders', async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().min(2),
      category: z.string().default('goods'),
      publishDate: z.string(),
      closingDate: z.string(),
      estimatedValue: z.number().min(0),
      description: z.string().optional().default(''),
      requisitionId: z.number().int().optional().nullable(),
    }).parse(req.body)

    const seq = Date.now().toString(36).toUpperCase()
    const ref = `TND-${new Date().getFullYear()}-${seq}`

    const [row] = await query(
      `INSERT INTO proc_tenders
        (tender_ref, title, category, publish_date, closing_date,
         estimated_value, description, requisition_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [ref, data.title, data.category, data.publishDate, data.closingDate,
       data.estimatedValue, data.description, data.requisitionId]
    )
    res.status(201).json({ id: row.id, tenderRef: row.tender_ref })
  } catch (e) { next(e) }
})

router.get('/tenders/:id/bids', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT b.*, v.name AS vendor_name
       FROM proc_tender_bids b
       JOIN proc_vendors v ON v.id = b.vendor_id
       WHERE b.tender_id = $1
       ORDER BY b.total_amount`,
      [req.params.id]
    )
    res.json(rows.map(r => ({
      id: r.id, vendorName: r.vendor_name, vendorId: r.vendor_id,
      totalAmount: parseFloat(r.total_amount),
      technicalScore: r.technical_score ? parseFloat(r.technical_score) : null,
      financialScore: r.financial_score ? parseFloat(r.financial_score) : null,
      overallScore: r.overall_score ? parseFloat(r.overall_score) : null,
      status: r.status, submittedAt: r.submitted_at,
    })))
  } catch (e) { next(e) }
})

router.post('/tenders/:id/bids', async (req, res, next) => {
  try {
    const data = z.object({
      vendorId: z.number().int(),
      totalAmount: z.number().min(0),
      technicalScore: z.number().min(0).max(100).optional().nullable(),
      financialScore: z.number().min(0).max(100).optional().nullable(),
    }).parse(req.body)

    const [row] = await query(
      `INSERT INTO proc_tender_bids
        (tender_id, vendor_id, total_amount, technical_score, financial_score)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.id, data.vendorId, data.totalAmount,
       data.technicalScore, data.financialScore]
    )
    res.status(201).json({ id: row.id })
  } catch (e) { next(e) }
})

router.post('/tenders/:id/evaluate', async (req, res, next) => {
  try {
    const tenderId = parseInt(req.params.id)
    const bids = await query(
      `SELECT * FROM proc_tender_bids WHERE tender_id = $1`, [tenderId]
    )
    if (!bids.length) return res.status(400).json({ error: 'No bids to evaluate' })

    await withTx(async (client) => {
      for (const bid of bids) {
        const tech = parseFloat(bid.technical_score || 50)
        const fin = parseFloat(bid.financial_score || 50)
        const overall = (tech * 0.6) + (fin * 0.4)
        await client.query(
          `UPDATE proc_tender_bids SET overall_score = $1 WHERE id = $2`,
          [overall, bid.id]
        )
      }

      await client.query(
        `UPDATE proc_tenders SET status = 'evaluation' WHERE id = $1`, [tenderId]
      )
    })

    res.json({ message: 'Evaluation complete' })
  } catch (e) { next(e) }
})

router.post('/tenders/:id/award', async (req, res, next) => {
  try {
    const data = z.object({ bidId: z.number().int() }).parse(req.body)

    await withTx(async (client) => {
      await client.query(
        `UPDATE proc_tender_bids SET status = 'awarded' WHERE id = $1`,
        [data.bidId]
      )
      await client.query(
        `UPDATE proc_tender_bids SET status = 'rejected'
         WHERE tender_id = $1 AND id != $2 AND status != 'withdrawn'`,
        [req.params.id, data.bidId]
      )
      await client.query(
        `UPDATE proc_tenders SET status = 'awarded' WHERE id = $1`,
        [req.params.id]
      )
    })

    res.json({ message: 'Tender awarded' })
  } catch (e) { next(e) }
})

// ─── Purchase Orders ────────────────────────────────────────────

router.get('/purchase-orders', async (req, res, next) => {
  try {
    const status = (req.query.status || '').trim()
    const cond = status && status !== 'all' ? `WHERE po.status = $1` : ''
    const params = status && status !== 'all' ? [status] : []

    const rows = await query(
      `SELECT po.*, v.name AS vendor_name
       FROM proc_purchase_orders po
       JOIN proc_vendors v ON v.id = po.vendor_id
       ${cond}
       ORDER BY po.order_date DESC`,
      params
    )

    const result = []
    for (const r of rows) {
      const items = await query(
        `SELECT * FROM proc_po_items WHERE purchase_order_id = $1 ORDER BY item_no`,
        [r.id]
      )
      result.push({
        id: r.id, poNumber: r.po_number, vendorName: r.vendor_name,
        vendorId: r.vendor_id, orderDate: r.order_date,
        deliveryDate: r.expected_delivery_date,
        currency: r.currency, totalAmount: parseFloat(r.total_amount),
        status: r.status, prNumber: r.pr_number,
        items: items.map(i => ({
          id: i.id, itemNo: i.item_no, description: i.description,
          unit: i.unit, quantity: parseInt(i.quantity),
          unitPrice: parseFloat(i.unit_price),
          total: parseFloat(i.total_price),
          receivedQty: parseInt(i.received_quantity || 0),
        })),
      })
    }

    res.json(result)
  } catch (e) { next(e) }
})

router.post('/purchase-orders', async (req, res, next) => {
  try {
    const data = z.object({
      vendorId: z.number().int(),
      orderDate: z.string(),
      expectedDeliveryDate: z.string(),
      currency: z.string().default('NGN'),
      prNumber: z.string().optional().nullable(),
      items: z.array(z.object({
        description: z.string().min(1),
        unit: z.string().default('units'),
        quantity: z.number().int().min(1),
        unitPrice: z.number().min(0),
      })).min(1),
    }).parse(req.body)

    const result = await withTx(async (client) => {
      const totalAmount = data.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
      const seq = Date.now().toString(36).toUpperCase()
      const poNumber = `PO-${new Date().getFullYear()}-${seq}`

      const { rows: [po] } = await client.query(
        `INSERT INTO proc_purchase_orders
          (po_number, vendor_id, order_date, expected_delivery_date,
           currency, total_amount, pr_number)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [poNumber, data.vendorId, data.orderDate, data.expectedDeliveryDate,
         data.currency, totalAmount, data.prNumber]
      )

      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i]
        await client.query(
          `INSERT INTO proc_po_items
            (purchase_order_id, item_no, description, unit, quantity, unit_price, total_price)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [po.id, i + 1, item.description, item.unit, item.quantity,
           item.unitPrice, item.quantity * item.unitPrice]
        )
      }

      return { id: po.id, poNumber: po.po_number, totalAmount }
    })

    res.status(201).json(result)
  } catch (e) { next(e) }
})

router.post('/purchase-orders/:id/approve', async (req, res, next) => {
  try {
    const [row] = await query(
      `UPDATE proc_purchase_orders SET status = 'approved'
       WHERE id = $1 AND status = 'draft' RETURNING *`,
      [req.params.id]
    )
    if (!row) return res.status(400).json({ error: 'PO not in draft state' })
    res.json({ id: row.id, status: row.status })
  } catch (e) { next(e) }
})

// ─── Goods Received ─────────────────────────────────────────────

router.get('/goods-received', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT g.*, po.po_number, v.name AS vendor_name
       FROM proc_goods_received g
       JOIN proc_purchase_orders po ON po.id = g.purchase_order_id
       JOIN proc_vendors v ON v.id = po.vendor_id
       ORDER BY g.received_date DESC`
    )
    res.json(rows.map(r => ({
      id: r.id, grnNumber: r.grn_number, poNumber: r.po_number,
      vendorName: r.vendor_name, receivedDate: r.received_date,
      receivedBy: r.received_by, status: r.status,
      remarks: r.remarks,
    })))
  } catch (e) { next(e) }
})

router.post('/goods-received', async (req, res, next) => {
  try {
    const data = z.object({
      purchaseOrderId: z.number().int(),
      receivedDate: z.string(),
      receivedBy: z.string(),
      remarks: z.string().optional().default(''),
      items: z.array(z.object({
        poItemId: z.number().int(),
        receivedQuantity: z.number().int().min(0),
        acceptedQuantity: z.number().int().min(0),
        rejectedQuantity: z.number().int().min(0).default(0),
        remarks: z.string().optional().default(''),
      })).min(1),
    }).parse(req.body)

    const result = await withTx(async (client) => {
      const seq = Date.now().toString(36).toUpperCase()
      const grnNumber = `GRN-${seq}`

      const { rows: [grn] } = await client.query(
        `INSERT INTO proc_goods_received
          (grn_number, purchase_order_id, received_date, received_by, remarks)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [grnNumber, data.purchaseOrderId, data.receivedDate,
         data.receivedBy, data.remarks]
      )

      for (const item of data.items) {
        await client.query(
          `INSERT INTO proc_grn_items
            (grn_id, po_item_id, received_quantity, accepted_quantity,
             rejected_quantity, remarks)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [grn.id, item.poItemId, item.receivedQuantity,
           item.acceptedQuantity, item.rejectedQuantity, item.remarks]
        )

        // Update PO item received quantity
        await client.query(
          `UPDATE proc_po_items
           SET received_quantity = COALESCE(received_quantity, 0) + $1
           WHERE id = $2`,
          [item.acceptedQuantity, item.poItemId]
        )
      }

      // Check if PO is fully received
      const { rows: poItems } = await client.query(
        `SELECT quantity, COALESCE(received_quantity, 0) AS received
         FROM proc_po_items WHERE purchase_order_id = $1`,
        [data.purchaseOrderId]
      )
      const allReceived = poItems.every(i => parseInt(i.received) >= parseInt(i.quantity))

      if (allReceived) {
        await client.query(
          `UPDATE proc_purchase_orders SET status = 'received' WHERE id = $1`,
          [data.purchaseOrderId]
        )
      }

      return { id: grn.id, grnNumber: grn.grn_number }
    })

    res.status(201).json(result)
  } catch (e) { next(e) }
})

// ─── Dashboard Summary ──────────────────────────────────────────

router.get('/summary', async (_req, res, next) => {
  try {
    const [prCount] = await query(`SELECT COUNT(*) AS c FROM proc_purchase_requisitions WHERE status = 'pending'`)
    const [poCount] = await query(`SELECT COUNT(*) AS c FROM proc_purchase_orders WHERE status IN ('draft','approved')`)
    const [tenderCount] = await query(`SELECT COUNT(*) AS c FROM proc_tenders WHERE status = 'published'`)
    const [vendorCount] = await query(`SELECT COUNT(*) AS c FROM proc_vendors WHERE status = 'active'`)

    const [poTotal] = await query(
      `SELECT COALESCE(SUM(total_amount), 0)::numeric AS total
       FROM proc_purchase_orders
       WHERE EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE)`
    )

    res.json({
      pendingRequisitions: parseInt(prCount.c),
      activePurchaseOrders: parseInt(poCount.c),
      openTenders: parseInt(tenderCount.c),
      activeVendors: parseInt(vendorCount.c),
      ytdPurchaseTotal: parseFloat(poTotal.total),
    })
  } catch (e) { next(e) }
})

export default router
