import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, RefreshCw, Webhook as WebhookIcon, Trash2, TestTube } from 'lucide-react';
import { webhooksApi } from '@/lib/api/webhooks';
import { useToast } from '@/hooks/use-toast';
// const AVAILABLE_EVENTS = [
//   'payment.confirmed',
//   'payment.failed',
//   'subscription.created',
//   'subscription.cancelled',
//   'subscription.renewed',
// ];
// export function WebhookConfig({ userId }: WebhookConfigProps) {
//   const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
//   const { toast } = useToast();
//   const [newWebhook, setNewWebhook] = useState<CreateWebhookRequest>({
//     url: '',
//     events: [],
//   });
//   const fetchWebhooks = async (isRefresh = false) => {
//     if (isRefresh) setRefreshing(true);
//     try {
//       const fetchedWebhooks = await webhooksApi.getWebhooks(userId);
//       setWebhooks(fetchedWebhooks);
//     } catch (error) {
//       console.error('Failed to fetch webhooks:', error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch webhooks",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };
//   const handleCreateWebhook = async () => {
//     if (!newWebhook.url.trim() || newWebhook.events.length === 0) {
//       toast({
//         title: "Validation Error",
//         description: "URL and at least one event are required",
//         variant: "destructive",
//       });
//       return;
//     }
//     // Basic URL validation
//     try {
//       new URL(newWebhook.url);
//     } catch {
//       toast({
//         title: "Validation Error",
//         description: "Please enter a valid URL",
//         variant: "destructive",
//       });
//       return;
//     }
//     setCreating(true);
//     try {
//       await webhooksApi.createWebhook(newWebhook, userId);
//       toast({
//         title: "Webhook Created",
//         description: "Webhook endpoint created successfully",
//       });
//       resetForm();
//       fetchWebhooks(true);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to create webhook",
//         variant: "destructive",
//       });
//     } finally {
//       setCreating(false);
//     }
//   };
//   const handleDeleteWebhook = async (webhookId: string) => {
//     try {
//       await webhooksApi.deleteWebhook(webhookId, userId);
//       toast({
//         title: "Webhook Deleted",
//         description: "Webhook endpoint deleted successfully",
//       });
//       fetchWebhooks(true);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to delete webhook",
//         variant: "destructive",
//       });
//     }
//   };
//   const handleTestWebhook = async (webhookId: string) => {
//     setTestingWebhook(webhookId);
//     try {
//       await webhooksApi.testWebhook(webhookId, userId);
//       toast({
//         title: "Test Sent",
//         description: "Test webhook payload sent successfully",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to send test webhook",
//         variant: "destructive",
//       });
//     } finally {
//       setTestingWebhook(null);
//     }
//   };
//   const handleEventToggle = (event: string, checked: boolean) => {
//     if (checked) {
//       setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] });
//     } else {
//       setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== event) });
//     }
//   };
//   const resetForm = () => {
//     setNewWebhook({ url: '', events: [] });
//     setShowCreateForm(false);
//   };
//   useEffect(() => {
//     fetchWebhooks();
//   }, [userId]);
//   const LoadingSkeleton = () => (
//     <div className="space-y-4">
//       {[1, 2].map((i) => (
//         <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
//           <div className="flex-1 space-y-2">
//             <Skeleton className="h-4 w-3/4" />
//             <div className="flex gap-2">
//               <Skeleton className="h-5 w-20" />
//               <Skeleton className="h-5 w-24" />
//             </div>
//             <Skeleton className="h-3 w-1/3" />
//           </div>
//           <div className="flex gap-2">
//             <Skeleton className="h-8 w-16" />
//             <Skeleton className="h-8 w-16" />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <WebhookIcon className="h-5 w-5" />
//             Webhook Endpoints
//           </div>
//           <div className="flex gap-2">
//             <Button 
//               onClick={() => fetchWebhooks(true)} 
//               disabled={refreshing}
//               variant="outline" 
//               size="sm"
//             >
//               <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
//             </Button>
//             <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm">
//               <Plus className="h-4 w-4 mr-1" />
//               {showCreateForm ? 'Cancel' : 'Add Webhook'}
//             </Button>
//           </div>
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         {showCreateForm && (
//           <div className="mb-6 p-4 border rounded-lg space-y-4 bg-muted/50">
//             <div>
//               <Label htmlFor="url">Webhook URL *</Label>
//               <Input
//                 id="url"
//                 type="url"
//                 value={newWebhook.url}
//                 onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
//                 placeholder="https://your-app.com/webhook"
//               />
//             </div>
//             <div>
//               <Label>Events to Subscribe *</Label>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
//                 {AVAILABLE_EVENTS.map((event) => (
//                   <div key={event} className="flex items-center space-x-2">
//                     <Checkbox
//                       id={event}
//                       checked={newWebhook.events.includes(event)}
//                       onCheckedChange={(checked) => handleEventToggle(event, checked as boolean)}
//                     />
//                     <Label htmlFor={event} className="text-sm">{event}</Label>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <Button onClick={handleCreateWebhook} disabled={creating} className="flex-1">
//                 {creating ? 'Creating...' : 'Create Webhook'}
//               </Button>
//               <Button onClick={resetForm} variant="outline">
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         )}
//         {loading ? (
//           <LoadingSkeleton />
//         ) : webhooks.length === 0 ? (
//           <div className="text-center py-8">
//             <p className="text-muted-foreground mb-4">No webhook endpoints configured</p>
//             <Button onClick={() => setShowCreateForm(true)} variant="outline">
//               <Plus className="h-4 w-4 mr-2" />
//               Add Your First Webhook
//             </Button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {webhooks.map((webhook) => (
//               <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
//                 <div className="flex-1">
//                   <p className="font-medium break-all">{webhook.url}</p>
//                   <div className="flex flex-wrap gap-1 mt-2">
//                     {webhook.events.map((event) => (
//                       <Badge key={event} variant="outline" className="text-xs">
//                         {event}
//                       </Badge>
//                     ))}
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     Created: {new Date(webhook.created_at).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <div className="flex space-x-2 ml-4">
//                   <Button
//                     onClick={() => handleTestWebhook(webhook.id)}
//                     disabled={testingWebhook === webhook.id}
//                     variant="outline"
//                     size="sm"
//                   >
//                     <TestTube className="h-4 w-4 mr-1" />
//                     {testingWebhook === webhook.id ? 'Testing...' : 'Test'}
//                   </Button>
//                   <Button
//                     onClick={() => handleDeleteWebhook(webhook.id)}
//                     variant="destructive"
//                     size="sm"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
const AVAILABLE_EVENTS = [
    'payment.confirmed',
    'payment.failed',
    'subscription.created',
    'subscription.cancelled',
    'subscription.renewed',
];
export function WebhookConfig({ userId }) {
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [testingWebhook, setTestingWebhook] = useState(null);
    const { toast } = useToast();
    const [newWebhook, setNewWebhook] = useState({
        url: '',
        events: [],
    });
    const fetchWebhooks = async (isRefresh = false) => {
        if (isRefresh)
            setRefreshing(true);
        try {
            const fetchedWebhooks = await webhooksApi.getWebhooks(userId);
            setWebhooks(fetchedWebhooks);
        }
        catch (error) {
            console.error('Failed to fetch webhooks:', error);
            toast({
                title: "Error",
                description: "Failed to fetch webhooks",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    const handleCreateWebhook = async () => {
        if (!newWebhook.url.trim() || newWebhook.events.length === 0) {
            toast({
                title: "Validation Error",
                description: "URL and at least one event are required",
                variant: "destructive",
            });
            return;
        }
        // Basic URL validation
        try {
            new URL(newWebhook.url);
        }
        catch {
            toast({
                title: "Validation Error",
                description: "Please enter a valid URL",
                variant: "destructive",
            });
            return;
        }
        setCreating(true);
        try {
            await webhooksApi.createWebhook(newWebhook, userId);
            toast({
                title: "Webhook Created",
                description: "Webhook endpoint created successfully",
            });
            resetForm();
            fetchWebhooks(true);
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to create webhook",
                variant: "destructive",
            });
        }
        finally {
            setCreating(false);
        }
    };
    const handleDeleteWebhook = async (webhookId) => {
        try {
            await webhooksApi.deleteWebhook(webhookId, userId);
            toast({
                title: "Webhook Deleted",
                description: "Webhook endpoint deleted successfully",
            });
            fetchWebhooks(true);
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete webhook",
                variant: "destructive",
            });
        }
    };
    const handleTestWebhook = async (webhookId) => {
        setTestingWebhook(webhookId);
        try {
            await webhooksApi.testWebhook(webhookId, userId);
            toast({
                title: "Test Sent",
                description: "Test webhook payload sent successfully",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to send test webhook",
                variant: "destructive",
            });
        }
        finally {
            setTestingWebhook(null);
        }
    };
    const handleEventToggle = (event, checked) => {
        if (checked) {
            setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] });
        }
        else {
            setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== event) });
        }
    };
    const resetForm = () => {
        setNewWebhook({ url: '', events: [] });
        setShowCreateForm(false);
    };
    useEffect(() => {
        fetchWebhooks();
    }, [userId]);
    const LoadingSkeleton = () => (_jsx("div", { className: "space-y-4", children: [1, 2].map((i) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex-1 space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-3/4" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Skeleton, { className: "h-5 w-20" }), _jsx(Skeleton, { className: "h-5 w-24" })] }), _jsx(Skeleton, { className: "h-3 w-1/3" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Skeleton, { className: "h-8 w-16" }), _jsx(Skeleton, { className: "h-8 w-16" })] })] }, i))) }));
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(WebhookIcon, { className: "h-5 w-5" }), "Webhook Endpoints"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => fetchWebhooks(true), disabled: refreshing, variant: "outline", size: "sm", children: _jsx(RefreshCw, { className: `h-4 w-4 ${refreshing ? 'animate-spin' : ''}` }) }), _jsxs(Button, { onClick: () => setShowCreateForm(!showCreateForm), size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-1" }), showCreateForm ? 'Cancel' : 'Add Webhook'] })] })] }) }), _jsxs(CardContent, { children: [showCreateForm && (_jsxs("div", { className: "mb-6 p-4 border rounded-lg space-y-4 bg-muted/50", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "url", children: "Webhook URL *" }), _jsx(Input, { id: "url", type: "url", value: newWebhook.url, onChange: (e) => setNewWebhook({ ...newWebhook, url: e.target.value }), placeholder: "https://your-app.com/webhook" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Events to Subscribe *" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2 mt-2", children: AVAILABLE_EVENTS.map((event) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: event, checked: newWebhook.events.includes(event), onCheckedChange: (checked) => handleEventToggle(event, checked) }), _jsx(Label, { htmlFor: event, className: "text-sm", children: event })] }, event))) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleCreateWebhook, disabled: creating, className: "flex-1", children: creating ? 'Creating...' : 'Create Webhook' }), _jsx(Button, { onClick: resetForm, variant: "outline", children: "Cancel" })] })] })), loading ? (_jsx(LoadingSkeleton, {})) : webhooks.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-muted-foreground mb-4", children: "No webhook endpoints configured" }), _jsxs(Button, { onClick: () => setShowCreateForm(true), variant: "outline", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Your First Webhook"] })] })) : (_jsx("div", { className: "space-y-4", children: webhooks.map((webhook) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium break-all", children: webhook.url }), _jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: webhook.events.map((event) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: event }, event))) }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: ["Created: ", new Date(webhook.created_at).toLocaleDateString()] })] }), _jsxs("div", { className: "flex space-x-2 ml-4", children: [_jsxs(Button, { onClick: () => handleTestWebhook(webhook.id), disabled: testingWebhook === webhook.id, variant: "outline", size: "sm", children: [_jsx(TestTube, { className: "h-4 w-4 mr-1" }), testingWebhook === webhook.id ? 'Testing...' : 'Test'] }), _jsx(Button, { onClick: () => handleDeleteWebhook(webhook.id), variant: "destructive", size: "sm", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }, webhook.id))) }))] })] }));
}
