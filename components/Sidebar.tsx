import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { MapPin, Trash, Coins, Medal, Settings, Home, Car } from "lucide-react"


const sidebarItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/report", icon: MapPin, label: "Report Waste" },
    { href: "/collect", icon: Trash, label: "Collect Waste" },
    { href: "/rewards", icon: Coins, label: "Rewards" },
    { href: "/leaderboard", icon: Medal, label: "Leaderboard" },
  ]

  interface SidebarProps{
    
  }
