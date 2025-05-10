"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Upload, UserPlus, Trash2, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import {
    getCompanyDetails,
    updateCompany,
    getOrganizationMembers,
    inviteOrganizationMember,
    deleteCompany,
    getUserRole
} from "@/lib/actions/company-actions"
import { useAuth } from "@/context/auth-context"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"

export function CompanySettings() {
    const { toast } = useToast()
    const { user, organization } = useAuth()

    const [formState, setFormState] = useState({
        name: "",
        dotNumber: "",
        mcNumber: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        email: "",
        primaryColor: "#0f766e"
    })

    const [isAdmin, setIsAdmin] = useState(false)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [members, setMembers] = useState<any[]>([])
    const [pendingInvitations, setPendingInvitations] = useState<any[]>([])
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviteRole, setInviteRole] = useState("basic_member")
    const [inviteLoading, setInviteLoading] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")

    useEffect(() => {
        if (organization) {
            // Fetch the user's role in the current company
            fetchUserRole()

            // Load company data
            fetchCompanyData()
            // Load organization members and invitations
            fetchOrganizationMembers()
            fetchOrganizationInvitations()
        }
    }, [organization, user])

    const fetchUserRole = async () => {
        try {
            const roleResult = await getUserRole()
            if (roleResult.success && roleResult.data) {
                const role = roleResult.data as string
                setUserRole(role)
                // Check if current user is an admin - adjust based on your role implementation
                setIsAdmin(
                    role === "admin" || role === "owner" || role === "ADMIN" || role === "OWNER"
                )
            }
        } catch (err) {
            console.error("Error fetching user role:", err)
        }
    }

    const fetchCompanyData = async () => {
        try {
            setLoading(true)
            const result = await getCompanyDetails()

            if (result.success && result.company) {
                setFormState({
                    name: result.company.name || "",
                    dotNumber: result.company.dotNumber || "",
                    mcNumber: result.company.mcNumber || "",
                    address: result.company.address || "",
                    city: result.company.city || "",
                    state: result.company.state || "",
                    zip: result.company.zip || "",
                    phone: result.company.phone || "",
                    email: result.company.email || "",
                    primaryColor: result.company.primaryColor || "#0f766e"
                })
            } else {
                setError("Failed to load company data")
            }
        } catch (err) {
            console.error("Error loading company data:", err)
            setError("Failed to load company data")
        } finally {
            setLoading(false)
        }
    }

    const fetchOrganizationMembers = async () => {
        try {
            const membersList = await getOrganizationMembers()
            setMembers(membersList.data || [])
        } catch (err) {
            console.error("Error loading members:", err)
        }
    }

    const fetchOrganizationInvitations = async () => {
        if (!isAdmin) return
        try {
            // Replace Clerk's invitation method with custom API
            const response = await fetch(`/api/organizations/${organization?.id}/invitations`)
            if (response.ok) {
                const data = await response.json()
                setPendingInvitations(data.invitations || [])
            } else {
                console.error("Failed to fetch invitations:", response.statusText)
            }
        } catch (err) {
            console.error("Error loading pending invitations:", err)
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }))

        // Clear any success/error messages when form changes
        setSuccess("")
        setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setSaving(true)
            setError("")
            setSuccess("")
            const result = await updateCompany(formState)
            if (result.success) {
                setSuccess("Company information updated successfully")
                toast({
                    title: "Company Updated",
                    description: "Your company information has been updated successfully"
                })
            } else {
                setError(
                    typeof result.error === "string"
                        ? result.error
                        : "Failed to update company information"
                )
            }
        } catch (err) {
            console.error("Error updating company:", err)
            setError("An unexpected error occurred")
        } finally {
            setSaving(false)
        }
    }

    const handleInviteMember = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inviteEmail) {
            setError("Email address is required")
            return
        }
        try {
            setInviteLoading(true)
            setError("")
            const result = await inviteOrganizationMember({
                email: inviteEmail,
                role: inviteRole
            })
            if (result.success) {
                toast({
                    title: "Invitation Sent",
                    description: "An invitation email has been sent to the user"
                })
                // Clear form and refresh members list
                setInviteEmail("")
                fetchOrganizationMembers()
            } else {
                setError(
                    typeof result.error === "string" ? result.error : "Failed to send invitation"
                )
            }
        } catch (err) {
            console.error("Error inviting member:", err)
            setError("An unexpected error occurred")
        } finally {
            setInviteLoading(false)
        }
    }

    const handleDeleteCompany = async () => {
        // Verify that the user typed DELETE to confirm
        if (deleteConfirmText !== "DELETE") {
            toast({
                title: "Error",
                description: "You must type DELETE to confirm deletion",
                variant: "destructive"
            })
            return
        }
        try {
            await deleteCompany()
            // The server action will handle redirection
        } catch (err) {
            console.error("Error deleting company:", err)
            setError("Failed to delete company")
            setDeleteDialogOpen(false)
        }
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "admin":
                return "Administrator"
            case "basic_member":
                return "Member"
            default:
                return role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")
        }
    }

    return (
        <Tabs defaultValue="general">
            <TabsList className="mb-4">
                <TabsTrigger value="general">General Information</TabsTrigger>
                <TabsTrigger value="members">Members & Permissions</TabsTrigger>
                {isAdmin && <TabsTrigger value="danger">Danger Zone</TabsTrigger>}
            </TabsList>

            <TabsContent value="general">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert variant="default" className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Success</AlertTitle>
                            <AlertDescription className="text-green-700">
                                {success}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-24 w-24 rounded-md border flex items-center justify-center bg-muted company-avatar-bg">
                                <span className="text-2xl font-bold text-white">
                                    {formState.name ? formState.name.charAt(0) : "C"}
                                </span>
                            </div>
                            <div>
                                <Button variant="outline" type="button">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Logo
                                </Button>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Recommended size: 512x512px. Max file size: 2MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Company Name</Label>
                            <Input
                                id="name"
                                value={formState.name}
                                onChange={e => handleChange("name", e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dotNumber">DOT Number</Label>
                            <Input
                                id="dotNumber"
                                value={formState.dotNumber || ""}
                                onChange={e => handleChange("dotNumber", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mcNumber">MC Number</Label>
                            <Input
                                id="mcNumber"
                                value={formState.mcNumber || ""}
                                onChange={e => handleChange("mcNumber", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="primaryColor">Brand Color</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="primaryColor"
                                    type="color"
                                    value={formState.primaryColor || "#0f766e"}
                                    onChange={e => handleChange("primaryColor", e.target.value)}
                                    className="w-12 h-12 p-1 cursor-pointer"
                                />
                                <span className="text-sm">{formState.primaryColor}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={formState.address || ""}
                                    onChange={e => handleChange("address", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formState.city || ""}
                                    onChange={e => handleChange("city", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Select
                                    value={formState.state || ""}
                                    onValueChange={(value: string) => handleChange("state", value)}
                                >
                                    <SelectTrigger id="state">
                                        <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AL">Alabama</SelectItem>
                                        <SelectItem value="AK">Alaska</SelectItem>
                                        <SelectItem value="AZ">Arizona</SelectItem>
                                        <SelectItem value="AR">Arkansas</SelectItem>
                                        <SelectItem value="CA">California</SelectItem>
                                        <SelectItem value="CO">Colorado</SelectItem>
                                        <SelectItem value="CT">Connecticut</SelectItem>
                                        <SelectItem value="DE">Delaware</SelectItem>
                                        <SelectItem value="FL">Florida</SelectItem>
                                        <SelectItem value="GA">Georgia</SelectItem>
                                        <SelectItem value="HI">Hawaii</SelectItem>
                                        <SelectItem value="ID">Idaho</SelectItem>
                                        <SelectItem value="IL">Illinois</SelectItem>
                                        <SelectItem value="IN">Indiana</SelectItem>
                                        <SelectItem value="IA">Iowa</SelectItem>
                                        <SelectItem value="KS">Kansas</SelectItem>
                                        <SelectItem value="KY">Kentucky</SelectItem>
                                        <SelectItem value="LA">Louisiana</SelectItem>
                                        <SelectItem value="ME">Maine</SelectItem>
                                        <SelectItem value="MD">Maryland</SelectItem>
                                        <SelectItem value="MA">Massachusetts</SelectItem>
                                        <SelectItem value="MI">Michigan</SelectItem>
                                        <SelectItem value="MN">Minnesota</SelectItem>
                                        <SelectItem value="MS">Mississippi</SelectItem>
                                        <SelectItem value="MO">Missouri</SelectItem>
                                        <SelectItem value="MT">Montana</SelectItem>
                                        <SelectItem value="NE">Nebraska</SelectItem>
                                        <SelectItem value="NV">Nevada</SelectItem>
                                        <SelectItem value="NH">New Hampshire</SelectItem>
                                        <SelectItem value="NJ">New Jersey</SelectItem>
                                        <SelectItem value="NM">New Mexico</SelectItem>
                                        <SelectItem value="NY">New York</SelectItem>
                                        <SelectItem value="NC">North Carolina</SelectItem>
                                        <SelectItem value="ND">North Dakota</SelectItem>
                                        <SelectItem value="OH">Ohio</SelectItem>
                                        <SelectItem value="OK">Oklahoma</SelectItem>
                                        <SelectItem value="OR">Oregon</SelectItem>
                                        <SelectItem value="PA">Pennsylvania</SelectItem>
                                        <SelectItem value="RI">Rhode Island</SelectItem>
                                        <SelectItem value="SC">South Carolina</SelectItem>
                                        <SelectItem value="SD">South Dakota</SelectItem>
                                        <SelectItem value="TN">Tennessee</SelectItem>
                                        <SelectItem value="TX">Texas</SelectItem>
                                        <SelectItem value="UT">Utah</SelectItem>
                                        <SelectItem value="VT">Vermont</SelectItem>
                                        <SelectItem value="VA">Virginia</SelectItem>
                                        <SelectItem value="WA">Washington</SelectItem>
                                        <SelectItem value="WV">West Virginia</SelectItem>
                                        <SelectItem value="WI">Wisconsin</SelectItem>
                                        <SelectItem value="WY">Wyoming</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="zip">ZIP Code</Label>
                                <Input
                                    id="zip"
                                    value={formState.zip || ""}
                                    onChange={e => handleChange("zip", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formState.phone || ""}
                                    onChange={e => handleChange("phone", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formState.email || ""}
                                    onChange={e => handleChange("email", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={fetchCompanyData}
                            disabled={loading || saving}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </TabsContent>

            <TabsContent value="members">
                <Card>
                    <CardHeader>
                        <CardTitle>Organization Members</CardTitle>
                        <CardDescription>
                            Manage the people who have access to your organization
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isAdmin && (
                            <form onSubmit={handleInviteMember} className="mb-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Invite New Member</h3>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="inviteEmail">Email Address</Label>
                                            <Input
                                                id="inviteEmail"
                                                type="email"
                                                placeholder="colleague@example.com"
                                                value={inviteEmail}
                                                onChange={e => setInviteEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="inviteRole">Role</Label>
                                            <Select
                                                value={inviteRole}
                                                onValueChange={setInviteRole}
                                            >
                                                <SelectTrigger id="inviteRole">
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">
                                                        Administrator
                                                    </SelectItem>
                                                    <SelectItem value="basic_member">
                                                        Member
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={inviteLoading}
                                        className="flex items-center"
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        {inviteLoading
                                            ? "Sending Invitation..."
                                            : "Send Invitation"}
                                    </Button>
                                </div>
                            </form>
                        )}

                        <Separator className="my-4" />

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium flex items-center">
                                <Users className="mr-2 h-4 w-4" />
                                Current Members
                            </h3>

                            <div className="space-y-2">
                                {members.length > 0 ? (
                                    members.map((member: any) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-3 rounded-md border"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage
                                                        src={member.publicUserData?.imageUrl}
                                                        alt={member.publicUserData?.firstName}
                                                    />
                                                    <AvatarFallback>
                                                        {member.publicUserData?.firstName?.[0] ||
                                                            "U"}
                                                        {member.publicUserData?.lastName?.[0] || ""}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">
                                                        {member.publicUserData?.firstName}{" "}
                                                        {member.publicUserData?.lastName}
                                                        {member.publicUserData?.userId ===
                                                            user?.id && " (You)"}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {
                                                            member.publicUserData
                                                                ?.emailAddresses?.[0]?.emailAddress
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                                                    {getRoleLabel(member.role)}
                                                </span>
                                                {isAdmin &&
                                                    member.publicUserData?.userId !== user?.id && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-destructive"
                                                        >
                                                            Remove
                                                        </Button>
                                                    )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No members found
                                    </p>
                                )}
                            </div>
                        </div>

                        {isAdmin && pendingInvitations.length > 0 && (
                            <div className="space-y-4 mt-8">
                                <h3 className="text-sm font-medium flex items-center">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Pending Invitations
                                </h3>

                                <div className="space-y-2">
                                    {pendingInvitations.map((invitation: any) => (
                                        <div
                                            key={invitation.id}
                                            className="flex items-center justify-between p-3 rounded-md border border-dashed"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {invitation.emailAddress[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">
                                                        {invitation.emailAddress}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Invited on{" "}
                                                        {new Date(
                                                            invitation.createdAt
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                                    Pending • {getRoleLabel(invitation.role)}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive"
                                                    onClick={async () => {
                                                        try {
                                                            // Replace Clerk's invitation revoke with custom API call
                                                            const response = await fetch(
                                                                `/api/organizations/${organization?.id}/invitations/${invitation.id}`,
                                                                {
                                                                    method: "DELETE"
                                                                }
                                                            )

                                                            if (response.ok) {
                                                                toast({
                                                                    title: "Invitation Revoked",
                                                                    description:
                                                                        "The invitation has been successfully revoked"
                                                                })
                                                                fetchOrganizationInvitations()
                                                            } else {
                                                                throw new Error(
                                                                    "Failed to revoke invitation"
                                                                )
                                                            }
                                                        } catch (err) {
                                                            console.error(
                                                                "Error revoking invitation:",
                                                                err
                                                            )
                                                            toast({
                                                                title: "Error",
                                                                description:
                                                                    "Failed to revoke invitation",
                                                                variant: "destructive"
                                                            })
                                                        }
                                                    }}
                                                >
                                                    Revoke
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {isAdmin && (
                <TabsContent value="danger">
                    <Card className="border-destructive">
                        <CardHeader className="text-destructive">
                            <CardTitle>Danger Zone</CardTitle>
                            <CardDescription>
                                These actions are destructive and cannot be undone. Please proceed
                                with caution.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 rounded-md bg-destructive/10 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-destructive">
                                            Delete Company
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            This will permanently delete your company and all
                                            associated data.
                                        </p>
                                    </div>
                                    <Dialog
                                        open={deleteDialogOpen}
                                        onOpenChange={setDeleteDialogOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Company
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Are you absolutely sure?</DialogTitle>
                                                <DialogDescription>
                                                    This action cannot be undone. This will
                                                    permanently delete your company account and
                                                    remove all associated data including vehicles,
                                                    drivers, loads, and other records.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <p className="text-sm font-medium text-destructive">
                                                    Please type &quot;DELETE&quot; to confirm
                                                </p>
                                                <Input
                                                    className="mt-2"
                                                    placeholder="Type DELETE to confirm"
                                                    value={deleteConfirmText}
                                                    onChange={e =>
                                                        setDeleteConfirmText(e.target.value)
                                                    }
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setDeleteDialogOpen(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={handleDeleteCompany}
                                                >
                                                    Delete Company
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            )}
        </Tabs>
    )
}
