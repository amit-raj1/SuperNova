import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Ticket, createTicket, getUserTickets, getTicketById, addTicketMessage } from "@/services/ticketService";
import { Loader2, MessageSquare, Plus, Search, X, Send, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const HelpSupport = () => {
	const { user } = useAuth();
	const { toast } = useToast();
	const navigate = useNavigate();
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [newMessage, setNewMessage] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState<string>("all");

	// Redirect admin users to admin dashboard  
	useEffect(() => {
		if (user?.role === 'admin') {
			toast({
				title: "Access Restricted",
				description: "Admin users should manage tickets from the Admin Dashboard.",
				variant: "destructive",
			});
			navigate('/admin');
		}
	}, [user, navigate, toast]);
	
	// Form state for creating ticket
	const [formData, setFormData] = useState({
		subject: "",
		category: "other",
		priority: "medium",
		description: "",
	});

	// Fetch user tickets
	const fetchTickets = async () => {
		try {
			setLoading(true);
			const response = await getUserTickets();
			setTickets(response.tickets);
		} catch (error) {
			console.error("Error fetching tickets:", error);
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to fetch tickets",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user) {
			fetchTickets();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	// Create new ticket
	const handleCreateTicket = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setLoading(true);
			await createTicket(formData);
			toast({
				title: "Success",
				description: "Ticket created successfully",
			});
			setShowCreateDialog(false);
			setFormData({
				subject: "",
				category: "other",
				priority: "medium",
				description: "",
			});
			fetchTickets();
		} catch (error) {
			console.error("Error creating ticket:", error);
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to create ticket",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	// View ticket details
	const handleViewTicket = async (ticketId: string) => {
		try {
			setLoading(true);
			const response = await getTicketById(ticketId);
			setSelectedTicket(response.ticket);
		} catch (error) {
			console.error("Error fetching ticket:", error);
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to fetch ticket details",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	// Send message
	const handleSendMessage = async () => {
		if (!selectedTicket || !newMessage.trim()) return;

		try {
			const response = await addTicketMessage(selectedTicket._id, newMessage);
			setSelectedTicket(response.ticket);
			setNewMessage("");
			toast({
				title: "Success",
				description: "Message sent successfully",
			});
			fetchTickets(); // Refresh ticket list
		} catch (error) {
			console.error("Error sending message:", error);
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to send message",
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

	// Get priority badge color
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

	// Filter tickets
	const filteredTickets = tickets.filter((ticket) => {
		const matchesSearch =
			ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
			ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
		return matchesSearch && matchesStatus;
	});

	return (
		<div className="min-h-screen bg-background text-foreground">
			<Navbar />
			<div className="container mx-auto px-4 py-24">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-3xl font-bold">Help & Support</h1>
					{user && (
						<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
							<DialogTrigger asChild>
								<Button className="flex items-center gap-2">
									<Plus size={18} />
									Create Ticket
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[600px]">
								<DialogHeader>
									<DialogTitle>Create Support Ticket</DialogTitle>
									<DialogDescription>
										Describe your issue and we'll get back to you as soon as possible.
									</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleCreateTicket} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="subject">Subject</Label>
										<Input
											id="subject"
											placeholder="Brief description of your issue"
											value={formData.subject}
											onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
											required
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="category">Category</Label>
											<Select
												value={formData.category}
												onValueChange={(value) => setFormData({ ...formData, category: value })}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="technical">Technical</SelectItem>
													<SelectItem value="billing">Billing</SelectItem>
													<SelectItem value="course">Course</SelectItem>
													<SelectItem value="account">Account</SelectItem>
													<SelectItem value="other">Other</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="priority">Priority</Label>
											<Select
												value={formData.priority}
												onValueChange={(value) => setFormData({ ...formData, priority: value })}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="low">Low</SelectItem>
													<SelectItem value="medium">Medium</SelectItem>
													<SelectItem value="high">High</SelectItem>
													<SelectItem value="critical">Critical</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor="description">Description</Label>
										<Textarea
											id="description"
											placeholder="Provide detailed information about your issue"
											rows={6}
											value={formData.description}
											onChange={(e) => setFormData({ ...formData, description: e.target.value })}
											required
										/>
									</div>
									<div className="flex justify-end gap-2">
										<Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
											Cancel
										</Button>
										<Button type="submit" disabled={loading}>
											{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
											Create Ticket
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>
					)}
				</div>

				{/* Support Tickets Section */}
				<div className="space-y-4">
					{!user ? (
						<Card>
							<CardContent className="pt-6">
								<p className="text-center text-muted-foreground">
									Please log in to view and create support tickets.
								</p>
							</CardContent>
						</Card>
						) : (
							<>
								{/* Filters */}
								<Card>
									<CardContent className="pt-6">
										<div className="flex gap-4">
											<div className="flex-1">
												<div className="relative">
													<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
													<Input
														placeholder="Search tickets..."
														className="pl-10"
														value={searchQuery}
														onChange={(e) => setSearchQuery(e.target.value)}
													/>
												</div>
											</div>
											<Select value={filterStatus} onValueChange={setFilterStatus}>
												<SelectTrigger className="w-[180px]">
													<SelectValue placeholder="Filter by status" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">All Status</SelectItem>
													<SelectItem value="open">Open</SelectItem>
													<SelectItem value="in-progress">In Progress</SelectItem>
													<SelectItem value="resolved">Resolved</SelectItem>
													<SelectItem value="closed">Closed</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</CardContent>
								</Card>

								{/* Tickets List */}
								{loading && tickets.length === 0 ? (
									<Card>
										<CardContent className="pt-6 flex justify-center">
											<Loader2 className="h-8 w-8 animate-spin" />
										</CardContent>
									</Card>
								) : filteredTickets.length === 0 ? (
									<Card>
										<CardContent className="pt-6">
											<p className="text-center text-muted-foreground">
												{searchQuery || filterStatus !== "all"
													? "No tickets match your search criteria."
													: "You haven't created any tickets yet. Click 'Create Ticket' to get started."}
											</p>
										</CardContent>
									</Card>
								) : (
									<div className="grid gap-4">
										{filteredTickets.map((ticket) => (
											<Card
												key={ticket._id}
												className="cursor-pointer hover:shadow-lg transition-shadow"
												onClick={() => handleViewTicket(ticket._id)}
											>
												<CardContent className="pt-6">
													<div className="flex justify-between items-start mb-2">
														<div className="flex-1">
															<div className="flex items-center gap-2 mb-2">
																<h3 className="text-lg font-semibold">{ticket.subject}</h3>
																<Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
																<Badge className={getPriorityColor(ticket.priority)} variant="outline">
																	{ticket.priority}
																</Badge>
															</div>
															<p className="text-sm text-muted-foreground mb-2">{ticket.ticketNumber}</p>
															<p className="text-sm line-clamp-2">{ticket.description}</p>
														</div>
													</div>
													<div className="flex justify-between items-center text-xs text-muted-foreground mt-4">
														<span>Category: {ticket.category}</span>
														<span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
														{ticket.messages.length > 0 && (
															<span className="flex items-center gap-1">
																<MessageSquare size={14} />
																{ticket.messages.length} {ticket.messages.length === 1 ? "message" : "messages"}
															</span>
														)}
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								)}
							</>
						)}
					</div>

				{/* Ticket Detail Dialog */}
				{selectedTicket && (
					<Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
						<DialogContent className="sm:max-w-[700px] max-h-[80vh]">
							<DialogHeader>
								<div className="flex justify-between items-start">
									<div>
										<DialogTitle>{selectedTicket.subject}</DialogTitle>
										<DialogDescription className="mt-1">{selectedTicket.ticketNumber}</DialogDescription>
									</div>
									<div className="flex gap-2">
										<Badge className={getStatusColor(selectedTicket.status)}>{selectedTicket.status}</Badge>
										<Badge className={getPriorityColor(selectedTicket.priority)} variant="outline">
											{selectedTicket.priority}
										</Badge>
									</div>
								</div>
							</DialogHeader>

							<div className="space-y-4">
								{/* Ticket Info */}
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="text-muted-foreground">Category:</span>{" "}
										<span className="font-medium">{selectedTicket.category}</span>
									</div>
									<div>
										<span className="text-muted-foreground">Created:</span>{" "}
										<span className="font-medium">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
									</div>
									{selectedTicket.assignedTo && (
										<div className="col-span-2">
											<span className="text-muted-foreground">Assigned to:</span>{" "}
											<span className="font-medium">{selectedTicket.assignedTo.name}</span>
										</div>
									)}
								</div>

								{/* Original Description */}
								<div className="p-4 bg-muted rounded-lg">
									<p className="text-sm font-medium mb-2">Description:</p>
									<p className="text-sm">{selectedTicket.description}</p>
								</div>

								{/* Messages */}
								<div>
									<p className="text-sm font-medium mb-2">Conversation:</p>
									<ScrollArea className="h-[300px] border rounded-lg p-4">
										{selectedTicket.messages.length === 0 ? (
											<p className="text-sm text-muted-foreground text-center py-8">No messages yet</p>
										) : (
											<div className="space-y-4">
												{selectedTicket.messages.map((msg) => (
													<div
														key={msg._id}
														className={`flex ${msg.isAdminReply ? "justify-start" : "justify-end"}`}
													>
														<div
															className={`max-w-[80%] p-3 rounded-lg ${
																msg.isAdminReply
																	? "bg-blue-500/10 border border-blue-500/20"
																	: "bg-primary text-primary-foreground"
															}`}
														>
															<div className="flex items-center gap-2 mb-1">
																<p className="text-xs font-medium">{msg.sender.name}</p>
																{msg.isAdminReply && (
																	<Badge variant="outline" className="text-xs">
																		Admin
																	</Badge>
																)}
															</div>
															<p className="text-sm">{msg.message}</p>
															<p className="text-xs opacity-70 mt-1">
																{new Date(msg.timestamp).toLocaleString()}
															</p>
														</div>
													</div>
												))}
											</div>
										)}
									</ScrollArea>
								</div>

								{/* Message Input */}
								{selectedTicket.status !== "closed" && (
									<div className="flex gap-2">
										<Input
											placeholder="Type your message..."
											value={newMessage}
											onChange={(e) => setNewMessage(e.target.value)}
											onKeyPress={(e) => {
												if (e.key === "Enter" && !e.shiftKey) {
													e.preventDefault();
													handleSendMessage();
												}
											}}
										/>
										<Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
											<Send size={18} />
										</Button>
									</div>
								)}
							</div>
						</DialogContent>
					</Dialog>
				)}
			</div>
		</div>
	);
};

export default HelpSupport;

