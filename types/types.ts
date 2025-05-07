export type Company = {
    id: string
    name: string
    dotNumber?: string | null
    mcNumber?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
    zip?: string | null
    phone?: string | null
    email?: string | null
    logoUrl?: string | null
    primaryColor?: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export type CompanyUser = {
    id: string
    userId: string
    companyId: string
    role: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    company?: Company
}
export type Driver = {
    id: string
    firstName: string
    lastName: string
    status: "active" | "inactive"
}

export type Vehicle = {
    id: string
    unitNumber: string
    type: "tractor" | "trailer"
    status: "active" | "inactive"
}

export type Load = {
    id: string
    pickupDate: Date
    deliveryDate: Date
    driver?: Driver
    vehicle?: Vehicle
    trailer?: Vehicle
    // add any additional fields (e.g. origin, destination, status, etc.) as needed
}
