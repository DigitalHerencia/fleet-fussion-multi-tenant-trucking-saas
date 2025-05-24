"use client"

import { useEffect, useState } from "react"
import { DispatchBoard } from "@/components/dispatch/dispatch-board"
import { DispatchSkeleton } from "@/components/dispatch/dispatch-skeleton"
import { Button } from "@/components/ui/button"
import { Filter, Plus, PlusCircle } from "lucide-react"
import { useAuth } from "@/lib/auth/context"


export default function DispatchPage() {
	const [isLoading, setIsLoading] = useState(true)
	const { company } = useAuth()

	useEffect(() => {
		// Simulate loading data
		const timer = setTimeout(() => {
			setIsLoading(false)
		}, 1000)

		return () => clearTimeout(timer)
	}, [])

	if (!company) {
		return <div className="p-4 text-[hsl(var(--muted-foreground))]">Company not found. Please create a company first.</div>
	}

	if (isLoading) {
		return <DispatchSkeleton />
	}

	return (
		<div className="w-full max-w-7xl mx-auto flex flex-col gap-8 mt-10 dispatch-page">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
				<div>
					<h1 className="page-title">Dispatch Board</h1>
					<p className="page-subtitle">Manage and track your loads</p>
				</div>
				<div className="flex flex-col gap-6 w-full md:w-auto">
        		<div className="w-full sm:w-auto">
        			<Button size="sm" className="w-full sm:w-auto">
          			<PlusCircle className="h-4 w-4 mr-2" />
         			 New Load
        			</Button>
        		</div>
          			<Button variant="outline" size="sm" className="w-full sm:w-auto">
            		<Filter className="h-4 w-4 mr-2" />
            		Filter
          			</Button>
      				</div>
				
			</div>
			<DispatchBoard loads={ [] } drivers={ [] } vehicles={ [] }  />
		</div>
	)
}


