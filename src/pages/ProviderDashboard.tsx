import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MedicalRecordCard } from "@/components/MedicalRecordCard";
import { PermissionControl } from "@/components/PermissionControl";
import { useToast } from "@/components/ui/use-toast";
import {
  Stethoscope,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Eye,
  Edit,
  MessageSquare,
  FileText,
  Pill,
  TestTube,
  Camera,
  Heart,
  Brain,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Star,
  Target,
  BarChart3,
  PieChart,
  Download,
  Share2,
  Settings,
  Bell,
  Video,
  UserPlus,
  Calendar as CalendarIcon,
  Zap,
  ShoppingCart,
  RefreshCw,
  LogOut,
  User,
  ChevronDown,
  Copy,
  Check,
  Loader2,
  Plus,
  Trash2
} from "lucide-react";
import {
  mockProviderPatients,
  mockProviderAppointments,
  mockDataAccessRequests,
  mockClinicalAlerts,
  mockRevenueMetrics,
  mockPopulationHealthMetrics,
  mockDataQualityMetrics,
  getTodaysAppointments,
  getPendingRequests,
  getUnreadAlerts,
  getCriticalPatients,
  getHighValuePatients,
  calculateTotalMonthlyRevenue,
  type ProviderPatient,
  type ProviderAppointment,
  type DataAccessRequest,
  type ClinicalAlert
} from "@/lib/provider-dashboard-data";
import { mockPatients, mockProviders, Patient } from "@/lib/mock-data";
import { mockProviderSpending } from "@/lib/monetization-data";

interface ProviderDashboardProps {
  providerId?: string;
}

export default function ProviderDashboard({ providerId = 'p1' }: ProviderDashboardProps) {
  const [selectedPatient, setSelectedPatient] = useState<ProviderPatient | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<ProviderAppointment | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<ClinicalAlert | null>(null);
  const [selectedMockPatient, setSelectedMockPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [marketplacePurchases, setMarketplacePurchases] = useState<string[]>([]);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Mock interaction states
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [patients, setPatients] = useState(mockProviderPatients);
  const [appointments, setAppointments] = useState(mockProviderAppointments);
  const [alerts, setAlerts] = useState(mockClinicalAlerts);
  const [requests, setRequests] = useState(mockDataAccessRequests);
  
  // Dev toggle for empty states
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showAllAlertsDialog, setShowAllAlertsDialog] = useState(false);
  const [showRequestDetailsDialog, setShowRequestDetailsDialog] = useState(false);
  const [showAppointmentDetailsDialog, setShowAppointmentDetailsDialog] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<DataAccessRequest | null>(null);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState<ProviderAppointment | null>(null);
  const [newPatientForm, setNewPatientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: ''
  });
  const [newAppointmentForm, setNewAppointmentForm] = useState({
    patientId: '',
    date: '',
    time: '',
    type: 'routine',
    reason: ''
  });

  const { toast } = useToast();

  // Mock interaction handlers
  const handleLoading = (key: string, duration = 1500) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }, duration);
  };

  const mockAddPatient = () => {
    if (!newPatientForm.firstName || !newPatientForm.lastName || !newPatientForm.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    handleLoading('addPatient');
    setTimeout(() => {
      const newPatient: ProviderPatient = {
        id: `patient-${Date.now()}`,
        firstName: newPatientForm.firstName,
        lastName: newPatientForm.lastName,
        dateOfBirth: newPatientForm.dateOfBirth,
        gender: 'other',
        contactInfo: {
          phone: newPatientForm.phone,
          email: newPatientForm.email,
          address: '123 New Patient St, City, ST 12345'
        },
        insurance: {
          provider: 'New Insurance Co',
          policyNumber: 'NEW-123456789',
          isPrimary: true
        },
        medicalInfo: {
          conditions: [],
          allergies: [],
          medications: [],
          lastVisit: new Date().toISOString().split('T')[0],
          riskLevel: 'low',
          chronicConditions: 0,
          emergencyContact: 'Emergency Contact'
        },
        dataSharing: {
          permissionsGranted: ['basic_info'],
          monetizationEnabled: false,
          dataQualityScore: 85,
          lastDataUpdate: new Date().toISOString(),
          totalRecords: 0,
          sharedRecords: 0
        },
        financials: {
          totalRevenue: 0,
          monthlyRevenue: 0,
          dataValue: 0,
          lastPayout: new Date().toISOString().split('T')[0]
        },
        engagement: {
          lastLogin: new Date().toISOString(),
          appUsageScore: 75,
          complianceRate: 90,
          responseRate: 85
        }
      };

      setPatients(prev => [...prev, newPatient]);
      setNewPatientForm({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '' });
      setShowAddPatientDialog(false);
      toast({
        title: "Patient Added",
        description: `${newPatient.firstName} ${newPatient.lastName} has been added to your roster`
      });
    }, 1500);
  };

  const mockScheduleAppointment = () => {
    if (!newAppointmentForm.patientId || !newAppointmentForm.date || !newAppointmentForm.time) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    handleLoading('scheduleAppointment');
    setTimeout(() => {
      const patient = patients.find(p => p.id === newAppointmentForm.patientId);
      const newAppointment: ProviderAppointment = {
        id: `apt-${Date.now()}`,
        patientId: newAppointmentForm.patientId,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
        appointmentType: newAppointmentForm.type as any,
        date: `${newAppointmentForm.date}T${newAppointmentForm.time}:00Z`,
        duration: 30,
        status: 'scheduled',
        reason: newAppointmentForm.reason || 'General consultation',
        preparationRequired: ['Bring current medications', 'Insurance card'],
        revenue: 180.00
      };

      setAppointments(prev => [...prev, newAppointment]);
      setNewAppointmentForm({ patientId: '', date: '', time: '', type: 'routine', reason: '' });
      setShowScheduleDialog(false);
      toast({
        title: "Appointment Scheduled",
        description: `Appointment scheduled for ${patient?.firstName} ${patient?.lastName}`
      });
    }, 1500);
  };

  const mockMessagePatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    handleLoading(`message-${patientId}`);
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: `Secure message sent to ${patient?.firstName} ${patient?.lastName}`
      });
    }, 1000);
  };

  const mockApproveRequest = (requestId: string) => {
    handleLoading(`approve-${requestId}`);
    setTimeout(() => {
      setRequests(prev => prev.map(req =>
        req.id === requestId ? { ...req, status: 'approved' as const } : req
      ));
      const request = requests.find(r => r.id === requestId);
      toast({
        title: "Request Approved",
        description: `Data access approved for ${request?.patientName}`
      });
    }, 1200);
  };

  const mockDenyRequest = (requestId: string) => {
    handleLoading(`deny-${requestId}`);
    setTimeout(() => {
      setRequests(prev => prev.map(req =>
        req.id === requestId ? { ...req, status: 'denied' as const } : req
      ));
      const request = requests.find(r => r.id === requestId);
      toast({
        title: "Request Denied",
        description: `Data access denied for ${request?.patientName}`
      });
    }, 1200);
  };

  const mockMarkAlertRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
    toast({
      title: "Alert Marked as Read",
      description: "Alert has been acknowledged"
    });
  };

  const mockTakeAction = (alertId: string) => {
    handleLoading(`action-${alertId}`);
    setTimeout(() => {
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? {
          ...alert,
          isRead: true,
          actionTaken: 'Provider action completed',
          resolvedAt: new Date().toISOString()
        } : alert
      ));
      const alert = alerts.find(a => a.id === alertId);
      toast({
        title: "Action Completed",
        description: `Action taken for ${alert?.patientName}`
      });
    }, 2000);
  };

  const mockEditAppointment = (appointmentId: string) => {
    handleLoading(`edit-${appointmentId}`);
    setTimeout(() => {
      const appointment = appointments.find(a => a.id === appointmentId);
      toast({
        title: "Appointment Updated",
        description: `Appointment for ${appointment?.patientName} has been updated`
      });
    }, 1000);
  };

  const mockStartTelehealth = (appointmentId: string) => {
    handleLoading(`telehealth-${appointmentId}`);
    setTimeout(() => {
      setAppointments(prev => prev.map(apt =>
        apt.id === appointmentId ? { ...apt, status: 'in-progress' as const } : apt
      ));
      const appointment = appointments.find(a => a.id === appointmentId);
      toast({
        title: "Telehealth Started",
        description: `Video consultation started with ${appointment?.patientName}`
      });
    }, 1500);
  };

  const mockExportReport = () => {
    handleLoading('export');
    setTimeout(() => {
      toast({
        title: "Report Exported",
        description: "Provider dashboard report has been downloaded"
      });
    }, 2000);
  };

  const mockRefreshData = () => {
    handleLoading('refresh');
    setTimeout(() => {
      // Simulate data refresh by updating timestamps
      setPatients(prev => prev.map(p => ({
        ...p,
        dataSharing: {
          ...p.dataSharing,
          lastDataUpdate: new Date().toISOString()
        }
      })));
      toast({
        title: "Data Refreshed",
        description: "All patient data has been synchronized"
      });
    }, 2500);
  };

  const mockCallPatient = (phone: string, patientName: string) => {
    handleLoading(`call-${phone}`);
    setTimeout(() => {
      toast({
        title: "Call Initiated",
        description: `Calling ${patientName} at ${phone}`
      });
    }, 800);
  };

  /**
   * Dev function to toggle between empty and populated states
   */
  const toggleEmptyState = () => {
    if (isEmptyState) {
      // Load populated data
      setPatients(mockProviderPatients);
      setAppointments(mockProviderAppointments);
      setAlerts(mockClinicalAlerts);
      setRequests(mockDataAccessRequests);
      setIsEmptyState(false);
    } else {
      // Reset to empty state
      setPatients([]);
      setAppointments([]);
      setAlerts([]);
      setRequests([]);
      setIsEmptyState(true);
    }
  };

  /**
   * Opens the filter dialog for patient/appointment filtering
   */
  const mockOpenFilterDialog = () => {
    setShowFilterDialog(true);
    toast({
      title: "Filter Options",
      description: "Advanced filtering options are now available"
    });
  };

  /**
   * Opens the all alerts dialog to view complete alert list
   */
  const mockViewAllAlerts = () => {
    setShowAllAlertsDialog(true);
    toast({
      title: "All Alerts",
      description: `Viewing all ${unreadAlerts.length} clinical alerts`
    });
  };

  /**
   * Opens request details dialog for a specific data access request
   */
  const mockViewRequestDetails = (request: DataAccessRequest) => {
    setSelectedRequestDetails(request);
    setShowRequestDetailsDialog(true);
    toast({
      title: "Request Details",
      description: `Viewing details for ${request.patientName}'s data request`
    });
  };

  /**
   * Opens appointment details dialog for a specific appointment
   */
  const mockViewAppointmentDetails = (appointment: ProviderAppointment) => {
    setSelectedAppointmentDetails(appointment);
    setShowAppointmentDetailsDialog(true);
    toast({
      title: "Appointment Details",
      description: `Viewing details for ${appointment.patientName}'s appointment`
    });
  };

  const todaysAppointments = getTodaysAppointments();
  const pendingRequests = getPendingRequests();
  const unreadAlerts = getUnreadAlerts();
  const criticalPatients = getCriticalPatients();
  const highValuePatients = getHighValuePatients();
  const monthlyRevenue = calculateTotalMonthlyRevenue();

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Stethoscope className="h-8 w-8 text-medical-primary" />
              Provider Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your patient roster, clinical workflows, and data monetization
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={isEmptyState ? "default" : "secondary"} 
              size="sm" 
              onClick={toggleEmptyState}
            >
              {isEmptyState ? "Load Sample Data" : "Show Empty State"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={mockExportReport}
              disabled={loadingStates.export}
            >
              {loadingStates.export ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Report
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddPatientDialog(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Patient
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={mockRefreshData}
              disabled={loadingStates.refresh}
            >
              {loadingStates.refresh ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold">{mockProviderPatients.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                  <p className="text-2xl font-bold">{todaysAppointments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{unreadAlerts.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Quality</p>
                  <p className="text-2xl font-bold text-green-600">{mockDataQualityMetrics.overallScore}%</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {unreadAlerts.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                Critical Alerts ({unreadAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unreadAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-start justify-between p-3 bg-white rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getAlertSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <h4 className="font-medium">{alert.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {alert.patientName} • {formatDateTime(alert.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.actionRequired && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => mockTakeAction(alert.id)}
                          disabled={loadingStates[`action-${alert.id}`]}
                        >
                          {loadingStates[`action-${alert.id}`] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Take Action'
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => mockMarkAlertRead(alert.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {unreadAlerts.length > 3 && (
                  <Button variant="outline" className="w-full" onClick={mockViewAllAlerts}>
                    View All {unreadAlerts.length} Alerts
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patient Roster</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="monetization">Data Revenue</TabsTrigger>
            <TabsTrigger value="requests">Access Requests</TabsTrigger>
            <TabsTrigger value="marketplace">
              <ShoppingCart className="h-4 w-4 mr-1" />
              Marketplace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Today's Schedule
                    <Button
                      size="sm"
                      className="ml-auto"
                      onClick={() => setShowScheduleDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {todaysAppointments.length} appointments scheduled for today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todaysAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{appointment.patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateTime(appointment.date)} • {appointment.duration} min
                            </p>
                            <p className="text-xs text-muted-foreground">{appointment.reason}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getAppointmentStatusColor(appointment.status)}>
                            {appointment.status.toUpperCase()}
                          </Badge>
                          {appointment.appointmentType === 'telehealth' && (
                            <Video className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                      </div>
                    ))}
                    {todaysAppointments.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-2" />
                        <p>No appointments scheduled for today</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Critical Patients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Critical Patients
                  </CardTitle>
                  <CardDescription>
                    Patients requiring immediate attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {criticalPatients.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No Critical Patients</h3>
                        <p className="text-muted-foreground mb-4">
                          Great news! No patients currently require immediate attention.
                        </p>
                        <Button variant="outline" onClick={toggleEmptyState}>
                          {isEmptyState ? "Load Sample Data" : "Show Empty State"}
                        </Button>
                      </div>
                    ) : (
                      criticalPatients.map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={patient.avatar} />
                            <AvatarFallback>
                              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                            <p className="text-sm text-muted-foreground">
                              Age {calculateAge(patient.dateOfBirth)} • {patient.medicalInfo.chronicConditions} chronic conditions
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {patient.medicalInfo.conditions.slice(0, 2).map((condition) => (
                                <Badge key={condition} variant="outline" className="text-xs">
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRiskLevelColor(patient.medicalInfo.riskLevel)}>
                            {patient.medicalInfo.riskLevel.toUpperCase()}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPatient(patient)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Revenue Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Total Revenue</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(mockRevenueMetrics.totalRevenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Data Monetization</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(mockRevenueMetrics.dataMonetizationRevenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Clinical Services</span>
                      <span className="text-lg font-bold text-purple-600">
                        {formatCurrency(mockRevenueMetrics.clinicalServiceRevenue)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Population Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Risk Distribution</span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(mockPopulationHealthMetrics.riskDistribution).map(([level, count]) => {
                          const percentage = (count / mockPopulationHealthMetrics.totalPatients) * 100;
                          return (
                            <div key={level}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs capitalize">{level} Risk</span>
                                <span className="text-xs">{count} patients</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Quality Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Data Quality Score</span>
                        <span className="text-sm font-bold text-green-600">
                          {mockDataQualityMetrics.overallScore}%
                        </span>
                      </div>
                      <Progress value={mockDataQualityMetrics.overallScore} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Completeness</span>
                        <span className="text-xs">{mockDataQualityMetrics.completenessScore}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Accuracy</span>
                        <span className="text-xs">{mockDataQualityMetrics.accuracyScore}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Timeliness</span>
                        <span className="text-xs">{mockDataQualityMetrics.timelinessScore}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" onClick={mockOpenFilterDialog}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Patient Roster */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockProviderPatients
                .filter(patient =>
                  searchQuery === '' ||
                  `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  patient.medicalInfo.conditions.some(condition =>
                    condition.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                )
                .map((patient) => (
                  <Card key={patient.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={patient.avatar} />
                            <AvatarFallback>
                              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{patient.firstName} {patient.lastName}</CardTitle>
                            <CardDescription>
                              Age {calculateAge(patient.dateOfBirth)} • {patient.gender}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getRiskLevelColor(patient.medicalInfo.riskLevel)}>
                          {patient.medicalInfo.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Last Visit:</span>
                            <p className="font-medium">{formatDate(patient.medicalInfo.lastVisit)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Next Appointment:</span>
                            <p className="font-medium">
                              {patient.medicalInfo.nextAppointment ?
                                formatDate(patient.medicalInfo.nextAppointment) :
                                'Not scheduled'
                              }
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Chronic Conditions:</span>
                            <p className="font-medium">{patient.medicalInfo.chronicConditions}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Data Quality:</span>
                            <p className="font-medium text-green-600">{patient.dataSharing.dataQualityScore}%</p>
                          </div>
                        </div>

                        {/* Medical Conditions */}
                        <div>
                          <span className="text-sm text-muted-foreground">Conditions:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {patient.medicalInfo.conditions.slice(0, 3).map((condition) => (
                              <Badge key={condition} variant="outline" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                            {patient.medicalInfo.conditions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{patient.medicalInfo.conditions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Allergies */}
                        {patient.medicalInfo.allergies.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground">Allergies:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {patient.medicalInfo.allergies.slice(0, 2).map((allergy) => (
                                <Badge key={allergy} variant="outline" className="text-xs bg-red-50 text-red-700">
                                  {allergy}
                                </Badge>
                              ))}
                              {patient.medicalInfo.allergies.length > 2 && (
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                                  +{patient.medicalInfo.allergies.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Revenue and Data Sharing */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Monthly Revenue: </span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(patient.financials.monthlyRevenue)}
                            </span>
                            {patient.dataSharing.monetizationEnabled && (
                              <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                                Data Monetized
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => mockMessagePatient(patient.id)}
                              disabled={loadingStates[`message-${patient.id}`]}
                            >
                              {loadingStates[`message-${patient.id}`] ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <MessageSquare className="h-4 w-4 mr-1" />
                              )}
                              Message
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setSelectedPatient(patient)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment Management
                </CardTitle>
                <CardDescription>
                  Manage and track all patient appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <CalendarIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Appointments Scheduled</h3>
                      <p className="text-muted-foreground mb-6">
                        You don't have any appointments scheduled yet. Start by scheduling your first appointment.
                      </p>
                      <div className="flex justify-center gap-2">
                        <Button onClick={() => setShowScheduleDialog(true)}>
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Schedule Appointment
                        </Button>
                        <Button variant="outline" onClick={toggleEmptyState}>
                          {isEmptyState ? "Load Sample Data" : "Show Empty State"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    appointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              {appointment.appointmentType === 'telehealth' ? (
                                <Video className="h-6 w-6 text-blue-600" />
                              ) : (
                                <Stethoscope className="h-6 w-6 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold">{appointment.patientName}</h3>
                              <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(appointment.date)} • {appointment.duration} minutes
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getAppointmentStatusColor(appointment.status)}>
                              {appointment.status.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {appointment.appointmentType}
                            </Badge>
                          </div>
                        </div>

                        {appointment.preparationRequired.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Preparation Required:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {appointment.preparationRequired.map((item, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-blue-600">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Revenue: </span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(appointment.revenue)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => mockEditAppointment(appointment.id)}
                              disabled={loadingStates[`edit-${appointment.id}`]}
                            >
                              {loadingStates[`edit-${appointment.id}`] ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Edit className="h-4 w-4 mr-1" />
                              )}
                              Edit
                            </Button>
                            {appointment.appointmentType === 'telehealth' ? (
                              <Button
                                size="sm"
                                onClick={() => mockStartTelehealth(appointment.id)}
                                disabled={loadingStates[`telehealth-${appointment.id}`]}
                              >
                                {loadingStates[`telehealth-${appointment.id}`] ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Video className="h-4 w-4 mr-1" />
                                )}
                                Start Call
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => mockViewAppointmentDetails(appointment)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Population Health Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Population Health Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Chronic Condition Prevalence</h4>
                      {mockPopulationHealthMetrics.chronicConditionPrevalence.map((condition) => (
                        <div key={condition.condition} className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{condition.condition}</span>
                            <span className="text-sm font-medium">{condition.percentage}%</span>
                          </div>
                          <Progress value={condition.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Outcome Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Clinical Outcomes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPopulationHealthMetrics.outcomeMetrics.map((metric) => (
                      <div key={metric.metric} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{metric.metric}</h4>
                          <div className="flex items-center gap-2">
                            {metric.trend === 'improving' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : metric.trend === 'declining' ? (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            ) : (
                              <Activity className="h-4 w-4 text-gray-600" />
                            )}
                            <span className={`text-sm font-medium ${metric.trend === 'improving' ? 'text-green-600' :
                              metric.trend === 'declining' ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                              {metric.trend}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Current</span>
                          <span className="text-sm font-medium">{metric.value}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Benchmark</span>
                          <span className="text-sm">{metric.benchmark}%</span>
                        </div>
                        <Progress value={metric.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Patient Compliance Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {mockPopulationHealthMetrics.complianceRates.medication}%
                    </div>
                    <div className="text-sm text-muted-foreground">Medication Adherence</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {mockPopulationHealthMetrics.complianceRates.appointments}%
                    </div>
                    <div className="text-sm text-muted-foreground">Appointment Attendance</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {mockPopulationHealthMetrics.complianceRates.screenings}%
                    </div>
                    <div className="text-sm text-muted-foreground">Preventive Screenings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monetization" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revenue Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Data Monetization Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(mockRevenueMetrics.dataMonetizationRevenue)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Data Revenue</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {formatCurrency(mockRevenueMetrics.averageRevenuePerPatient)}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg per Patient</div>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Revenue Growth</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-bold text-green-600">
                            +{mockRevenueMetrics.revenueGrowth}%
                          </span>
                        </div>
                      </div>
                      <Progress value={mockRevenueMetrics.revenueGrowth} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Revenue Patients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top Revenue Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockRevenueMetrics.topRevenuePatients.map((patient, index) => (
                      <div key={patient.patientId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-yellow-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{patient.patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              Data Value: {formatCurrency(patient.dataValue)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(patient.revenue)}
                          </p>
                          <p className="text-xs text-muted-foreground">Total Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Quality Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Patient Data Quality Scores
                </CardTitle>
                <CardDescription>
                  Higher quality data generates more revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDataQualityMetrics.patientDataScores.map((patient) => (
                    <div key={patient.patientId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{patient.patientName}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-green-600">{patient.score}%</span>
                            {patient.monetizationEligible ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">Eligible</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 text-xs">Not Eligible</Badge>
                            )}
                          </div>
                        </div>
                        <Progress value={patient.score} className="h-2 mb-2" />
                        {patient.issues.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {patient.issues.map((issue, index) => (
                              <Badge key={index} variant="outline" className="text-xs text-orange-700">
                                {issue}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Data Access Requests
                </CardTitle>
                <CardDescription>
                  Manage patient data access requests and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDataAccessRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{request.patientName}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {request.requestType.replace('_', ' ')} • {request.urgency} priority
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Requested: {formatDateTime(request.requestDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.status === 'denied' ? 'bg-red-100 text-red-800' :
                                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                            }>
                              {request.status.toUpperCase()}
                            </Badge>
                            <Badge className={
                              request.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                                request.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                                  request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                            }>
                              {request.urgency.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Reason:</p>
                          <p className="text-sm text-muted-foreground">{request.reason}</p>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Requested Data:</p>
                          <div className="flex flex-wrap gap-1">
                            {request.requestedData.map((data) => (
                              <Badge key={data} variant="outline" className="text-xs">
                                {data.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {request.monetizationImpact > 0 && (
                              <>
                                <span className="text-muted-foreground">Revenue Impact: </span>
                                <span className="font-medium text-green-600">
                                  {formatCurrency(request.monetizationImpact)}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => mockDenyRequest(request.id)}
                                  disabled={loadingStates[`deny-${request.id}`]}
                                >
                                  {loadingStates[`deny-${request.id}`] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Deny'
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => mockApproveRequest(request.id)}
                                  disabled={loadingStates[`approve-${request.id}`]}
                                >
                                  {loadingStates[`approve-${request.id}`] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Approve'
                                  )}
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline" onClick={() => mockViewRequestDetails(request)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Marketplace Tab Content */}
        <div className={activeTab === 'marketplace' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient List */}
            <div className="lg:col-span-1 space-y-4">
              <Tabs defaultValue="patients" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="patients">My Patients</TabsTrigger>

                </TabsList>

                <TabsContent value="patients">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Your Patients
                      </CardTitle>
                      <CardDescription>
                        Select a patient to view their records
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockPatients.slice(0, 5).map((patient) => (
                          <div
                            key={patient.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${selectedMockPatient?.id === patient.id ? 'bg-accent border-primary' : ''
                              }`}
                            onClick={() => setSelectedMockPatient(patient)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={patient.avatar} alt={patient.name} />
                                <AvatarFallback className="bg-gradient-to-br from-medical-primary to-medical-secondary text-white">
                                  {patient.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">{patient.name}</p>
                                <p className="text-sm text-muted-foreground">{patient.email}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {patient.medicalHistory.length} records
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

              </Tabs>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="patients" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="patients">Patient Records</TabsTrigger>
                </TabsList>

                <TabsContent value="patients">
                  {selectedMockPatient ? (
                    <Tabs defaultValue="overview" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="records">Medical Records</TabsTrigger>
                        <TabsTrigger value="permissions">Permissions</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={selectedMockPatient.avatar} alt={selectedMockPatient.name} />
                                <AvatarFallback className="bg-gradient-to-br from-medical-primary to-medical-secondary text-white">
                                  {selectedMockPatient.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-xl font-semibold">{selectedMockPatient.name}</h3>
                                <p className="text-muted-foreground">{selectedMockPatient.email}</p>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{selectedMockPatient.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{selectedMockPatient.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{selectedMockPatient.address}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">DOB: {selectedMockPatient.dateOfBirth}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{selectedMockPatient.medicalHistory.length} Medical Records</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">Emergency: {selectedMockPatient.emergencyContact?.name}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="records" className="space-y-4">
                        <div className="space-y-4">
                          {selectedMockPatient.medicalHistory.map((record) => (
                            <MedicalRecordCard
                              key={record.id}
                              record={record}
                              isProvider={true}
                              onUpdateRecord={() => { }}
                            />
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="permissions" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Data Access Permissions</CardTitle>
                            <CardDescription>
                              Manage what patient data you can access
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <PermissionControl
                              patientId={selectedMockPatient.id}
                              providerId={providerId}
                              permissions={selectedMockPatient.permissions || {}}
                              onPermissionChange={() => { }}
                              isProvider={true}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Select a Patient</h3>
                        <p className="text-muted-foreground text-center">
                          Choose a patient from the list to view their medical records and manage permissions.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Patient Details Modal */}
        {selectedPatient && (
          <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={selectedPatient.avatar} />
                    <AvatarFallback>
                      {selectedPatient.firstName.charAt(0)}{selectedPatient.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {selectedPatient.firstName} {selectedPatient.lastName}
                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => mockCallPatient(selectedPatient.contactInfo.phone, `${selectedPatient.firstName} ${selectedPatient.lastName}`)}
                      disabled={loadingStates[`call-${selectedPatient.contactInfo.phone}`]}
                    >
                      {loadingStates[`call-${selectedPatient.contactInfo.phone}`] ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Phone className="h-4 w-4 mr-1" />
                      )}
                      Call
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => mockMessagePatient(selectedPatient.id)}
                      disabled={loadingStates[`message-${selectedPatient.id}`]}
                    >
                      {loadingStates[`message-${selectedPatient.id}`] ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <MessageSquare className="h-4 w-4 mr-1" />
                      )}
                      Message
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Patient Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Age:</span>
                        <span>{calculateAge(selectedPatient.dateOfBirth)} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="capitalize">{selectedPatient.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risk Level:</span>
                        <Badge className={getRiskLevelColor(selectedPatient.medicalInfo.riskLevel)}>
                          {selectedPatient.medicalInfo.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Visit:</span>
                        <span>{formatDate(selectedPatient.medicalInfo.lastVisit)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Revenue & Data</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Revenue:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(selectedPatient.financials.monthlyRevenue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data Value:</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(selectedPatient.financials.dataValue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data Quality:</span>
                        <span className="font-medium text-green-600">
                          {selectedPatient.dataSharing.dataQualityScore}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monetization:</span>
                        <Badge className={selectedPatient.dataSharing.monetizationEnabled ?
                          'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }>
                          {selectedPatient.dataSharing.monetizationEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Medical Conditions</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.medicalInfo.conditions.map((condition) => (
                      <Badge key={condition} variant="outline">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Allergies</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.medicalInfo.allergies.map((allergy) => (
                      <Badge key={allergy} variant="outline" className="bg-red-50 text-red-700">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Current Medications</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.medicalInfo.medications.map((medication) => (
                      <Badge key={medication} variant="outline" className="bg-blue-50 text-blue-700">
                        {medication}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Data Sharing Permissions</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.dataSharing.permissionsGranted.map((permission) => (
                      <Badge key={permission} variant="outline" className="bg-green-50 text-green-700">
                        {permission.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Patient Dialog */}
        <Dialog open={showAddPatientDialog} onOpenChange={setShowAddPatientDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invite New Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newPatientForm.firstName}
                    onChange={(e) => setNewPatientForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newPatientForm.lastName}
                    onChange={(e) => setNewPatientForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPatientForm.email}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john.doe@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newPatientForm.phone}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={newPatientForm.dateOfBirth}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddPatientDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={mockAddPatient}
                  disabled={loadingStates.addPatient}
                >
                  {loadingStates.addPatient ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Appointment Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patientSelect">Patient *</Label>
                <select
                  id="patientSelect"
                  className="w-full p-2 border rounded-md"
                  value={newAppointmentForm.patientId}
                  onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, patientId: e.target.value }))}
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAppointmentForm.date}
                    onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAppointmentForm.time}
                    onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="type">Appointment Type</Label>
                <select
                  id="type"
                  className="w-full p-2 border rounded-md"
                  value={newAppointmentForm.type}
                  onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="routine">Routine</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="urgent">Urgent</option>
                  <option value="telehealth">Telehealth</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={newAppointmentForm.reason}
                  onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="General consultation"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={mockScheduleAppointment}
                  disabled={loadingStates.scheduleAppointment}
                >
                  {loadingStates.scheduleAppointment ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-2" />
                  )}
                  Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filters
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="filter-specialty">Specialty</Label>
                  <select id="filter-specialty" className="w-full p-2 border rounded-md">
                    <option value="">All Specialties</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="psychiatry">Psychiatry</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="filter-risk">Risk Level</Label>
                  <select id="filter-risk" className="w-full p-2 border rounded-md">
                    <option value="">All Risk Levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="filter-status">Status</Label>
                  <select id="filter-status" className="w-full p-2 border rounded-md">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="filter-date">Date Range</Label>
                  <select id="filter-date" className="w-full p-2 border rounded-md">
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Filters Applied",
                    description: "Patient list has been filtered based on your criteria"
                  });
                  setShowFilterDialog(false);
                }}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* All Alerts Dialog */}
        <Dialog open={showAllAlertsDialog} onOpenChange={setShowAllAlertsDialog}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                All Clinical Alerts ({unreadAlerts.length})
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Card key={alert.id} className={`p-4 ${alert.isRead ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={
                            alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                          }>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{alert.category}</Badge>
                          {!alert.isRead && <Badge className="bg-blue-100 text-blue-800">NEW</Badge>}
                        </div>
                        <h4 className="font-medium mb-1">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Patient: {alert.patientName}</span>
                          <span>Time: {alert.timestamp}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {alert.actionRequired && !alert.actionTaken && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => mockTakeAction(alert.id)}
                            disabled={loadingStates[`action-${alert.id}`]}
                          >
                            {loadingStates[`action-${alert.id}`] ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Take Action'
                            )}
                          </Button>
                        )}
                        {!alert.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => mockMarkAlertRead(alert.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowAllAlertsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Request Details Dialog */}
        <Dialog open={showRequestDetailsDialog} onOpenChange={setShowRequestDetailsDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Access Request Details
              </DialogTitle>
            </DialogHeader>
            {selectedRequestDetails && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Patient Name</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequestDetails.patientName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Request Type</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequestDetails.requestType}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={
                      selectedRequestDetails.status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedRequestDetails.status === 'denied' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                    }>
                      {selectedRequestDetails.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Badge className={
                      selectedRequestDetails.priority === 'high' ? 'bg-red-100 text-red-800' :
                        selectedRequestDetails.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                    }>
                      {selectedRequestDetails.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Requested Data</Label>
                  <div className="mt-2 space-y-1">
                    {selectedRequestDetails.requestedData.map((data, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{data}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Purpose</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRequestDetails.purpose}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Requested Date</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequestDetails.requestDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Expiry Date</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequestDetails.expiryDate}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowRequestDetailsDialog(false)}>
                    Close
                  </Button>
                  {selectedRequestDetails.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          mockDenyRequest(selectedRequestDetails.id);
                          setShowRequestDetailsDialog(false);
                        }}
                        disabled={loadingStates[`deny-${selectedRequestDetails.id}`]}
                      >
                        {loadingStates[`deny-${selectedRequestDetails.id}`] ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          'Deny'
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          mockApproveRequest(selectedRequestDetails.id);
                          setShowRequestDetailsDialog(false);
                        }}
                        disabled={loadingStates[`approve-${selectedRequestDetails.id}`]}
                      >
                        {loadingStates[`approve-${selectedRequestDetails.id}`] ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          'Approve'
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Appointment Details Dialog */}
        <Dialog open={showAppointmentDetailsDialog} onOpenChange={setShowAppointmentDetailsDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Details
              </DialogTitle>
            </DialogHeader>
            {selectedAppointmentDetails && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Patient Name</Label>
                    <p className="text-sm text-muted-foreground">{selectedAppointmentDetails.patientName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Appointment Type</Label>
                    <Badge className={
                      selectedAppointmentDetails.appointmentType === 'telehealth' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                    }>
                      {selectedAppointmentDetails.appointmentType === 'telehealth' ? 'Telehealth' : 'In-Person'}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Date & Time</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointmentDetails.date} at {selectedAppointmentDetails.time}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Duration</Label>
                    <p className="text-sm text-muted-foreground">{selectedAppointmentDetails.duration}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={
                      selectedAppointmentDetails.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        selectedAppointmentDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          selectedAppointmentDetails.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                    }>
                      {selectedAppointmentDetails.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Badge className={
                      selectedAppointmentDetails.priority === 'high' ? 'bg-red-100 text-red-800' :
                        selectedAppointmentDetails.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                    }>
                      {selectedAppointmentDetails.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reason for Visit</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedAppointmentDetails.reason}</p>
                </div>
                {selectedAppointmentDetails.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedAppointmentDetails.notes}</p>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAppointmentDetailsDialog(false)}>
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      mockEditAppointment(selectedAppointmentDetails.id);
                      setShowAppointmentDetailsDialog(false);
                    }}
                    disabled={loadingStates[`edit-${selectedAppointmentDetails.id}`]}
                  >
                    {loadingStates[`edit-${selectedAppointmentDetails.id}`] ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    Edit Appointment
                  </Button>
                  {selectedAppointmentDetails.appointmentType === 'telehealth' && selectedAppointmentDetails.status === 'confirmed' && (
                    <Button
                      onClick={() => {
                        mockStartTelehealth(selectedAppointmentDetails.id);
                        setShowAppointmentDetailsDialog(false);
                      }}
                      disabled={loadingStates[`telehealth-${selectedAppointmentDetails.id}`]}
                    >
                      {loadingStates[`telehealth-${selectedAppointmentDetails.id}`] ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Video className="h-4 w-4 mr-2" />
                      )}
                      Start Call
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
