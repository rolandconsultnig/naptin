import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@eam/components/ui/button";
import { Input } from "@eam/components/ui/input";
import { Textarea } from "@eam/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@eam/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@eam/components/ui/form";
import { Checkbox } from "@eam/components/ui/checkbox";
import { useToast } from "@eam/hooks/use-toast";
import { apiRequest } from "@eam/lib/queryClient";

const maintenanceScheduleSchema = z.object({
  name: z.string().min(1, "Schedule name is required"),
  description: z.string().optional(),
  assetId: z.string().min(1, "Asset is required"),
  scheduleType: z.enum(["time_based", "usage_based", "condition_based"]),
  frequency: z.string().optional(),
  frequencyUnit: z.string().optional(),
  isActive: z.boolean(),
  nextDue: z.string().optional(),
  assignedTo: z.string().optional(),
});

type MaintenanceScheduleFormData = z.infer<typeof maintenanceScheduleSchema>;

interface MaintenanceScheduleFormProps {
  schedule?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MaintenanceScheduleForm({ schedule, onSuccess, onCancel }: MaintenanceScheduleFormProps) {
  const { toast } = useToast();

  const { data: assets } = useQuery({
    queryKey: ["/api/assets"],
    retry: false,
  });

  const form = useForm<MaintenanceScheduleFormData>({
    resolver: zodResolver(maintenanceScheduleSchema),
    defaultValues: {
      name: schedule?.name || "",
      description: schedule?.description || "",
      assetId: schedule?.assetId?.toString() || "",
      scheduleType: schedule?.scheduleType || "time_based",
      frequency: schedule?.frequency?.toString() || "",
      frequencyUnit: schedule?.frequencyUnit || "days",
      isActive: schedule?.isActive ?? true,
      nextDue: schedule?.nextDue ? new Date(schedule.nextDue).toISOString().slice(0, 10) : "",
      assignedTo: schedule?.assignedTo || "",
    },
  });

  const scheduleType = form.watch("scheduleType");

  const mutation = useMutation({
    mutationFn: async (data: MaintenanceScheduleFormData) => {
      const url = schedule ? `/api/maintenance-schedules/${schedule.id}` : "/api/maintenance-schedules";
      const method = schedule ? "PUT" : "POST";
      
      const payload = {
        ...data,
        assetId: parseInt(data.assetId),
        frequency: data.frequency ? parseInt(data.frequency) : null,
        nextDue: data.nextDue ? new Date(data.nextDue).toISOString() : null,
      };

              await apiRequest(url, { method, body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Maintenance schedule ${schedule ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${schedule ? 'update' : 'create'} maintenance schedule`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MaintenanceScheduleFormData) => {
    mutation.mutate(data);
  };

  const getFrequencyUnitOptions = () => {
    switch (scheduleType) {
      case "time_based":
        return [
          { value: "days", label: "Days" },
          { value: "weeks", label: "Weeks" },
          { value: "months", label: "Months" },
          { value: "years", label: "Years" },
        ];
      case "usage_based":
        return [
          { value: "hours", label: "Operating Hours" },
          { value: "miles", label: "Miles" },
          { value: "cycles", label: "Cycles" },
          { value: "units", label: "Units Produced" },
        ];
      case "condition_based":
        return [
          { value: "temperature", label: "Temperature Threshold" },
          { value: "vibration", label: "Vibration Level" },
          { value: "pressure", label: "Pressure Reading" },
          { value: "wear", label: "Wear Indicator" },
        ];
      default:
        return [];
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter schedule name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assetId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets?.map((asset: any) => (
                        <SelectItem key={asset.id} value={asset.id.toString()}>
                          {asset.name} - {asset.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule Type</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time_based">Time Based</SelectItem>
                      <SelectItem value="usage_based">Usage Based</SelectItem>
                      <SelectItem value="condition_based">Condition Based</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {scheduleType !== "condition_based" && (
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter frequency" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="frequencyUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {scheduleType === "condition_based" ? "Condition Type" : "Frequency Unit"}
                </FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFrequencyUnitOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nextDue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned To</FormLabel>
                <FormControl>
                  <Input placeholder="Enter technician name or ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter maintenance schedule description and procedures" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active Schedule</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Enable this schedule to automatically generate work orders
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : schedule ? "Update Schedule" : "Create Schedule"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
