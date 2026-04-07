package com.owltalk.ui.config

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.owltalk.MainActivity
import com.owltalk.R
import com.owltalk.utils.ConfigManager

class ConfigActivity : AppCompatActivity() {
    
    private lateinit var etIp: EditText
    private lateinit var etPort: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnSave: Button
    private lateinit var configManager: ConfigManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        configManager = ConfigManager(this)
        
        // Create layout programmatically
        val layout = android.widget.LinearLayout(this).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setPadding(60, 80, 60, 60)
        }
        
        // Title
        val title = android.widget.TextView(this).apply {
            text = "Server Configuration"
            textSize = 28f
            gravity = android.view.Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 20, 0, 50)
        }
        
        // Security icon/text
        val security = android.widget.TextView(this).apply {
            text = "🔒 Admin Only"
            textSize = 14f
            gravity = android.view.Gravity.CENTER
            setTextColor(android.graphics.Color.parseColor("#FF6B6B"))
            setPadding(0, 0, 0, 30)
        }
        
        // Password label
        val passwordLabel = android.widget.TextView(this).apply {
            text = "Admin Password:"
            textSize = 16f
            setPadding(0, 10, 0, 10)
        }
        
        // Password input
        etPassword = EditText(this).apply {
            hint = "Enter admin password"
            inputType = android.text.InputType.TYPE_CLASS_TEXT or 
                       android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
            minHeight = 100
            setPadding(30, 30, 30, 30)
            textSize = 18f
        }
        
        // IP label
        val ipLabel = android.widget.TextView(this).apply {
            text = "Server IP:"
            textSize = 16f
            setPadding(0, 20, 0, 10)
        }
        
        // IP input
        etIp = EditText(this).apply {
            hint = "e.g., 192.168.1.115"
            setText(configManager.getIp())
            inputType = android.text.InputType.TYPE_CLASS_TEXT
            minHeight = 100
            setPadding(30, 30, 30, 30)
            textSize = 18f
        }
        
        // Port label
        val portLabel = android.widget.TextView(this).apply {
            text = "Server Port:"
            textSize = 16f
            setPadding(0, 20, 0, 10)
        }
        
        // Port input
        etPort = EditText(this).apply {
            hint = "e.g., 5000"
            setText(configManager.getPort())
            inputType = android.text.InputType.TYPE_CLASS_NUMBER
            minHeight = 100
            setPadding(30, 30, 30, 30)
            textSize = 18f
        }
        
        // Save button
        btnSave = Button(this).apply {
            text = "Save Configuration"
            minHeight = 120
            setTextSize(android.util.TypedValue.COMPLEX_UNIT_SP, 18f)
            setBackgroundColor(android.graphics.Color.parseColor("#4CAF50"))
            setTextColor(android.graphics.Color.WHITE)
            setOnClickListener { saveConfig() }
        }
        
        // Info text
        val info = android.widget.TextView(this).apply {
            text = "For emulator: Use 10.0.2.2\nFor device: Use server IP"
            textSize = 14f
            setTextColor(android.graphics.Color.GRAY)
            gravity = android.view.Gravity.CENTER
            setPadding(0, 30, 0, 0)
        }
        
        layout.addView(title)
        layout.addView(security)
        layout.addView(passwordLabel)
        layout.addView(etPassword)
        layout.addView(ipLabel)
        layout.addView(etIp)
        layout.addView(portLabel)
        layout.addView(etPort)
        layout.addView(btnSave)
        layout.addView(info)
        
        setContentView(layout)
    }
    
    private fun saveConfig() {
        val password = etPassword.text.toString().trim()
        val ip = etIp.text.toString().trim()
        val port = etPort.text.toString().trim()
        
        // Verify password
        if (!configManager.verifyPassword(password)) {
            Toast.makeText(this, "❌ Invalid admin password!", Toast.LENGTH_SHORT).show()
            return
        }
        
        // Validate inputs
        if (ip.isEmpty()) {
            Toast.makeText(this, "❌ Please enter IP address", Toast.LENGTH_SHORT).show()
            etIp.requestFocus()
            return
        }
        
        if (port.isEmpty()) {
            Toast.makeText(this, "❌ Please enter port number", Toast.LENGTH_SHORT).show()
            etPort.requestFocus()
            return
        }
        
        // Save configuration
        configManager.saveConfig(ip, port)
        
        Toast.makeText(this, "✅ Configuration saved successfully!", Toast.LENGTH_SHORT).show()
        
        // Restart app to apply changes
        val intent = Intent(this, MainActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
        startActivity(intent)
        finish()
    }
    
    override fun onBackPressed() {
        super.onBackPressed()
        finish()
    }
}

