import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
	getDashboardStats,
	getAllUsers,
	getAllCourses,
	updateUserRole,
	deleteUser,
	deleteCourse,
	DashboardStats,
	User,
	Course,
} from "@/services/adminService";
import {
	getAllTickets,
	updateTicketStatus,
	getTicketStats,
	getTicketById,
	addTicketMessage,
	Ticket,
	TicketStats,
} from "@/services/ticketService";
import {
	Users,
	BookOpen,
	Ticket as TicketIcon,
	TrendingUp,
	Loader2,
	Search,
	Shield,
	ShieldOff,
	Trash2,
	CheckCircle,
	Clock,
	AlertCircle,
	Send,
	X,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminDashboard = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { toast } = useToast();

	const [loading, setLoading] = useState(false);
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
	const [users, setUsers] = useState<User[]>([]);
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [courses, setCourses] = useState<Course[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [ticketFilter, setTicketFilter] = useState("all");
	const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
	const [showTicketDialog, setShowTicketDialog] = useState(false);
	const [ticketMessage, setTicketMessage] = useState("");

	// Check if user is admin
	useEffect(() => {
		if (user && user.role !== "admin") {
			toast({
				title: "Access Denied",
				description: "You don't have permission to access this page",
				variant: "destructive",
			});
			navigate("/dashboard");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, navigate]);

	// Fetch dashboard statistics
	const fetchStats = async () => {
		try {
			setLoading(true);
			const [dashboardData, ticketData] = await Promise.all([getDashboardStats(), getTicketStats()]);
			setStats(dashboardData.stats);
			setTicketStats(ticketData.stats);
		} catch (error) {
			console.error("Error fetching stats:", error);
			toast({
				title: "Error",
				description: "Failed to fetch dashboard statistics",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	// Fetch users
	const fetchUsers = async () => {
		try {
			const response = await getAllUsers({ limit: 100 });
			setUsers(response.users);
		} catch (error) {
			console.error("Error fetching users:", error);
		}
	};

	// Fetch tickets
	const fetchTickets = async () => {
		try {
			const response = await getAllTickets({
				status: ticketFilter !== "all" ? ticketFilter : undefined,
			});
			// Filter out closed tickets when "all" is selected
			const filteredTickets = ticketFilter === "all" 
				? response.tickets.filter((ticket: Ticket) => ticket.status !== "closed")
				: response.tickets;
			setTickets(filteredTickets);
		} catch (error) {
			console.error("Error fetching tickets:", error);
		}
	};

	// Fetch courses
	const fetchCourses = async () => {
		try {
			const response = await getAllCourses({ limit: 100 });
			setCourses(response.courses);
		} catch (error) {
			console.error("Error fetching courses:", error);
		}
	};

	useEffect(() => {
		if (user?.role === "admin") {
			fetchStats();
			fetchUsers();
			fetchTickets();
			fetchCourses();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	useEffect(() => {
		if (user?.role === "admin") {
			fetchTickets();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ticketFilter]);

	// Handle role change
	const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
		try {
			await updateUserRole(userId, newRole);
			toast({
				title: "Success",
				description: "User role updated successfully",
			});
			fetchUsers();
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update user role",
				variant: "destructive",
			});
		}
	};

	// Handle user delete
	const handleDeleteUser = async (userId: string) => {
		try {
			await deleteUser(userId);
			toast({
				title: "Success",
				description: "User deleted successfully",
			});
			fetchUsers();
			fetchStats();
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete user",
				variant: "destructive",
			});
		}
	};

	// Handle ticket status change
	const handleTicketStatusChange = async (ticketId: string, newStatus: string) => {
		try {
			await updateTicketStatus(ticketId, { status: newStatus });
			toast({
				title: "Success",
				description: "Ticket status updated successfully",
			});
			fetchTickets();
			fetchStats();
			// Update selected ticket if it's open
			if (selectedTicket?._id === ticketId) {
				const updated = await getTicketById(ticketId);
				setSelectedTicket(updated.ticket);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update ticket status",
				variant: "destructive",
			});
		}
	};

	// Handle viewing ticket details
	const handleViewTicket = async (ticketId: string) => {
		try {
			const response = await getTicketById(ticketId);
			setSelectedTicket(response.ticket);
			setShowTicketDialog(true);
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to load ticket details",
				variant: "destructive",
			});
		}
	};

	// Handle sending message to ticket
	const handleSendMessage = async () => {
		if (!selectedTicket || !ticketMessage.trim()) return;

		try {
			await addTicketMessage(selectedTicket._id, ticketMessage, true); // isAdminReply: true
			toast({
				title: "Success",
				description: "Message sent successfully",
			});
			setTicketMessage("");
			// Refresh ticket details
			const updated = await getTicketById(selectedTicket._id);
			setSelectedTicket(updated.ticket);
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to send message",
				variant: "destructive",
			});
		}
	};


	// Handle course delete
	const handleDeleteCourse = async (courseId: string) => {
		try {
			await deleteCourse(courseId);
			toast({
				title: "Success",
				description: "Course deleted successfully",
			});
			fetchCourses();
			fetchStats();
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete course",
				variant: "destructive",
			});
		}
	};

	// Get status badge color
	const getStatusColor = (status: string) => {
		switch (status) {
			case "open":
				return "bg-blue-500";
			case "in-progress":
				return "bg-yellow-500";
			case "resolved":
				return "bg-green-500";
			case "closed":
				return "bg-gray-500";
			default:
				return "bg-gray-500";
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "low":
				return "bg-green-500";
			case "medium":
				return "bg-yellow-500";
			case "high":
				return "bg-orange-500";
			case "critical":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	// Filter users
	const filteredUsers = users.filter(
		(u) =>
			u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			u.email.toLowerCase().includes(searchQuery.toLowerCase())
	);

	if (!user || user.role !== "admin") {
		return null;
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<Navbar />
			<div className="container mx-auto px-4 py-24">
				<h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

				{/* Stats Overview */}
				{loading ? (
					<div className="flex justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin" />
					</div>
				) : (
					<>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Total Users</CardTitle>
									<Users className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats?.users.total || 0}</div>
									<p className="text-xs text-muted-foreground">
										{stats?.users.newThisWeek || 0} new this week
									</p>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Total Courses</CardTitle>
									<BookOpen className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats?.courses || 0}</div>
									<p className="text-xs text-muted-foreground">Active courses</p>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
									<TicketIcon className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{ticketStats?.total || 0}</div>
									<p className="text-xs text-muted-foreground">{ticketStats?.open || 0} open tickets</p>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Admin Users</CardTitle>
									<TrendingUp className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats?.users.admins || 0}</div>
									<p className="text-xs text-muted-foreground">
										{stats?.users.regular || 0} regular users
									</p>
								</CardContent>
							</Card>
						</div>

						{/* Tabs for different sections */}
						<Tabs defaultValue="tickets" className="w-full">
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="tickets">Tickets</TabsTrigger>
								<TabsTrigger value="users">Users</TabsTrigger>
								<TabsTrigger value="courses">Courses</TabsTrigger>
							</TabsList>

							{/* Tickets Tab */}
							<TabsContent value="tickets" className="space-y-4">
								<Card>
									<CardHeader>
										<div className="flex justify-between items-center">
											<div>
												<CardTitle>Support Tickets</CardTitle>
												<CardDescription>Manage and respond to user support tickets</CardDescription>
											</div>
											<Select value={ticketFilter} onValueChange={setTicketFilter}>
												<SelectTrigger className="w-[180px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">All Active Tickets</SelectItem>
													<SelectItem value="open">Open</SelectItem>
													<SelectItem value="in-progress">In Progress</SelectItem>
													<SelectItem value="resolved">Resolved</SelectItem>
													<SelectItem value="closed">Closed</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</CardHeader>
									<CardContent>
										<ScrollArea className="h-[600px]">
											{tickets.length === 0 ? (
												<p className="text-center text-muted-foreground py-8">No tickets found</p>
											) : (
												<div className="space-y-4">
													{tickets.map((ticket) => (
														<Card key={ticket._id}>
															<CardContent className="pt-6">
																<div className="flex justify-between items-start mb-4">
																	<div className="flex-1">
																		<div className="flex items-center gap-2 mb-2">
																			<h3 className="font-semibold">{ticket.subject}</h3>
																			<Badge className={getStatusColor(ticket.status)}>
																				{ticket.status}
																			</Badge>
																			<Badge
																				className={getPriorityColor(ticket.priority)}
																				variant="outline"
																			>
																				{ticket.priority}
																			</Badge>
																		</div>
																		<p className="text-sm text-muted-foreground mb-2">
																			{ticket.ticketNumber}
																		</p>
																		<p className="text-sm mb-2">{ticket.description}</p>
																		<p className="text-xs text-muted-foreground">
																			Created by: {ticket.userId?.name || 'Unknown'} ({ticket.userId?.email || 'N/A'})
																		</p>
																	</div>
																</div>
																<div className="flex gap-2">
																	<Select
																		value={ticket.status}
																		onValueChange={(value) =>
																			handleTicketStatusChange(ticket._id, value)
																		}
																	>
																		<SelectTrigger className="w-[180px]">
																			<SelectValue />
																		</SelectTrigger>
																		<SelectContent>
																			<SelectItem value="open">Open</SelectItem>
																			<SelectItem value="in-progress">In Progress</SelectItem>
																			<SelectItem value="resolved">Resolved</SelectItem>
																			<SelectItem value="closed">Closed</SelectItem>
																		</SelectContent>
																	</Select>
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() => handleViewTicket(ticket._id)}
																	>
																		View Details
																	</Button>
																</div>
															</CardContent>
														</Card>
													))}
												</div>
											)}
										</ScrollArea>
									</CardContent>
								</Card>
							</TabsContent>

							{/* Users Tab */}
							<TabsContent value="users" className="space-y-4">
								<Card>
									<CardHeader>
										<CardTitle>User Management</CardTitle>
										<CardDescription>Manage user accounts and permissions</CardDescription>
										<div className="relative">
											<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												placeholder="Search users..."
												className="pl-10"
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
											/>
										</div>
									</CardHeader>
									<CardContent>
										<ScrollArea className="h-[600px]">
											<div className="space-y-4">
												{filteredUsers.map((u) => (
													<Card key={u._id}>
														<CardContent className="pt-6">
															<div className="flex justify-between items-start">
																<div className="flex-1">
																	<div className="flex items-center gap-2 mb-2">
																		<h3 className="font-semibold">{u.name}</h3>
																		<Badge variant={u.role === "admin" ? "default" : "secondary"}>
																			{u.role}
																		</Badge>
																	</div>
																	<p className="text-sm text-muted-foreground">{u.email}</p>
																	<p className="text-xs text-muted-foreground mt-2">
																		Joined: {new Date(u.createdAt).toLocaleDateString()}
																	</p>
																</div>
																<div className="flex gap-2">
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() =>
																			handleRoleChange(
																				u._id,
																				u.role === "admin" ? "user" : "admin"
																			)
																		}
																	>
																		{u.role === "admin" ? (
																			<>
																				<ShieldOff className="h-4 w-4 mr-2" />
																				Remove Admin
																			</>
																		) : (
																			<>
																				<Shield className="h-4 w-4 mr-2" />
																				Make Admin
																			</>
																		)}
																	</Button>
																	<AlertDialog>
																		<AlertDialogTrigger asChild>
																			<Button variant="destructive" size="sm">
																				<Trash2 className="h-4 w-4" />
																			</Button>
																		</AlertDialogTrigger>
																		<AlertDialogContent>
																			<AlertDialogHeader>
																				<AlertDialogTitle>Delete User</AlertDialogTitle>
																				<AlertDialogDescription>
																					Are you sure you want to delete this user? This action
																					cannot be undone.
																				</AlertDialogDescription>
																			</AlertDialogHeader>
																			<AlertDialogFooter>
																				<AlertDialogCancel>Cancel</AlertDialogCancel>
																				<AlertDialogAction
																					onClick={() => handleDeleteUser(u._id)}
																					className="bg-destructive"
																				>
																					Delete
																				</AlertDialogAction>
																			</AlertDialogFooter>
																		</AlertDialogContent>
																	</AlertDialog>
																</div>
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										</ScrollArea>
									</CardContent>
								</Card>
							</TabsContent>

							{/* Courses Tab */}
							<TabsContent value="courses" className="space-y-4">
								<Card>
									<CardHeader>
										<CardTitle>Course Management</CardTitle>
										<CardDescription>View and manage all courses in the system</CardDescription>
									</CardHeader>
									<CardContent>
										<ScrollArea className="h-[600px]">
											{courses.length === 0 ? (
												<p className="text-center text-muted-foreground py-8">No courses found</p>
											) : (
												<div className="space-y-4">
													{courses.map((course) => (
														<Card key={course._id}>
															<CardContent className="pt-6">
																<div className="flex justify-between items-start">
																	<div className="flex-1">
																		<h3 className="font-semibold mb-2">{course.title}</h3>
																		<p className="text-sm text-muted-foreground">
																			Created by: {course.userId?.name || 'Unknown'} ({course.userId?.email || 'N/A'})
																		</p>
																		<p className="text-xs text-muted-foreground mt-2">
																			Created: {new Date(course.createdAt).toLocaleDateString()}
																		</p>
																	</div>
																	<AlertDialog>
																		<AlertDialogTrigger asChild>
																			<Button variant="destructive" size="sm">
																				<Trash2 className="h-4 w-4 mr-2" />
																				Delete
																			</Button>
																		</AlertDialogTrigger>
																		<AlertDialogContent>
																			<AlertDialogHeader>
																				<AlertDialogTitle>Delete Course</AlertDialogTitle>
																				<AlertDialogDescription>
																					Are you sure you want to delete this course? This action
																					cannot be undone.
																				</AlertDialogDescription>
																			</AlertDialogHeader>
																			<AlertDialogFooter>
																				<AlertDialogCancel>Cancel</AlertDialogCancel>
																				<AlertDialogAction
																					onClick={() => handleDeleteCourse(course._id)}
																					className="bg-destructive"
																				>
																					Delete
																				</AlertDialogAction>
																			</AlertDialogFooter>
																		</AlertDialogContent>
																	</AlertDialog>
																</div>
															</CardContent>
														</Card>
													))}
												</div>
											)}
										</ScrollArea>
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</>
				)}
			</div>

			{/* Ticket Detail Dialog */}
			<Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
				<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Ticket Details</DialogTitle>
						<DialogDescription>
							{selectedTicket && `Ticket #${selectedTicket.ticketNumber}`}
						</DialogDescription>
					</DialogHeader>
					{selectedTicket && (
						<div className="space-y-4">
							{/* Ticket Info */}
							<div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
								<div>
									<p className="text-sm font-medium">Subject</p>
									<p className="text-sm text-muted-foreground">{selectedTicket.subject}</p>
								</div>
								<div>
									<p className="text-sm font-medium">Status</p>
									<Badge className={getStatusColor(selectedTicket.status)}>
										{selectedTicket.status}
									</Badge>
								</div>
								<div>
									<p className="text-sm font-medium">Priority</p>
									<Badge className={getPriorityColor(selectedTicket.priority)} variant="outline">
										{selectedTicket.priority}
									</Badge>
								</div>
								<div>
									<p className="text-sm font-medium">Category</p>
									<p className="text-sm text-muted-foreground">{selectedTicket.category}</p>
								</div>
								<div>
									<p className="text-sm font-medium">Created By</p>
									<p className="text-sm text-muted-foreground">
										{selectedTicket.userId?.name || 'Unknown'} ({selectedTicket.userId?.email || 'N/A'})
									</p>
								</div>
								<div>
									<p className="text-sm font-medium">Created</p>
									<p className="text-sm text-muted-foreground">
										{new Date(selectedTicket.createdAt).toLocaleString()}
									</p>
								</div>
							</div>

							{/* Description */}
							<div>
								<p className="text-sm font-medium mb-2">Description</p>
								<div className="p-4 bg-muted rounded-lg">
									<p className="text-sm">{selectedTicket.description}</p>
								</div>
							</div>

							{/* Messages */}
							<div>
								<p className="text-sm font-medium mb-2">Conversation</p>
								<ScrollArea className="h-[300px] rounded-lg border p-4">
									<div className="space-y-4">
										{selectedTicket.messages && selectedTicket.messages.length > 0 ? (
											selectedTicket.messages.map((msg: any, idx: number) => (
												<div
													key={idx}
													className={`flex ${msg.isAdminReply ? "justify-end" : "justify-start"}`}
												>
													<div
														className={`max-w-[70%] rounded-lg p-3 ${
															msg.isAdminReply
																? "bg-primary text-primary-foreground"
																: "bg-muted"
														}`}
													>
														{msg.isAdminReply && (
															<p className="text-xs font-semibold mb-1">
																Admin
															</p>
														)}
														<p className="text-sm">{msg.message}</p>
														<p className="text-xs opacity-70 mt-1">
															{new Date(msg.timestamp).toLocaleString()}
														</p>
													</div>
												</div>
											))
										) : (
											<p className="text-center text-muted-foreground text-sm">
												No messages yet
											</p>
										)}
									</div>
								</ScrollArea>
							</div>

							{/* Send Message */}
							<div className="flex gap-2">
								<Input
									placeholder="Type your response..."
									value={ticketMessage}
									onChange={(e) => setTicketMessage(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleSendMessage();
										}
									}}
								/>
								<Button onClick={handleSendMessage} disabled={!ticketMessage.trim()}>
									<Send className="h-4 w-4" />
								</Button>
							</div>

							{/* Status Update */}
							<div className="flex gap-2 items-center">
								<p className="text-sm font-medium">Update Status:</p>
								<Select
									value={selectedTicket.status}
									onValueChange={(value) => handleTicketStatusChange(selectedTicket._id, value)}
								>
									<SelectTrigger className="w-[180px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="open">Open</SelectItem>
										<SelectItem value="in-progress">In Progress</SelectItem>
										<SelectItem value="resolved">Resolved</SelectItem>
										<SelectItem value="closed">Closed</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default AdminDashboard;
