'use client'
import { useState,useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import {Menu,Coins,Leaf,Search,Bell,User,ChevronDown,LogIn,LogOut} from 'lucide-react';
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import {Web3Auth} from '@web3Auth/modal';
import {CHAIN_NAMESPACES,IProvider,WEB3AUTH_NETWORK} from '@web3Auth/base';
import { EthereumPrivateKeyProvider } from "@web3Auth/ethereum-provider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { createUser, getUnreadNotifications, markNotificationAsRead, getUserByEmail, getUserBalance } from "@/utils/db/actions"


const clientId=process.env.WEB3_AUTH_CLIENT_ID

const chainConfig={
    chainNamespace:CHAIN_NAMESPACES.EIP155,
    chainId: "0xaa36a7",
    rpcTarget: "https://rpc.ankr.com/eth_sepolia",
    displayName: "Ethereum Sepolia Testnet",
    blockExplorerUrl: "https://sepolia.etherscan.io",
    ticker: "ETH",
    tickerName: "Ethereum",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",

}
const privateKeyProvider=new EthereumPrivateKeyProvider({
    config:{chainConfig},
});

const web3auth=new Web3Auth({
    clientId,
    web3AuthNetwork:WEB3AUTH_NETWORK.TESTNET,
    privateKeyProvider,
})

interface HeaderProps{
    onMenuClick:()=>void;
    totalEarnings:number;
}

export default function Header({ onMenuClick, totalEarnings }: HeaderProps) {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const pathname = usePathname()
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [balance, setBalance] = useState(0)

  console.log('user info', userInfo);
    useEffect(() => {
        const init = async () => {
          try {
            await web3Auth.initModal();
            setProvider(web3Auth.provider);
    
            if (web3Auth.connected) {
              setLoggedIn(true);
              const user = await web3Auth.getUserInfo();
              setUserInfo(user);
              if (user.email) {
                localStorage.setItem('userEmail', user.email);
                try {
                  await createUser(user.email, user.name || 'Anonymous User');
                } catch (error) {
                  console.error("Error creating user:", error);
                }
              }
            }
          } catch (error) {
            console.error("Error initializing Web3Auth:", error);
          } finally {
            setLoading(false);
          }
        };
    
        init();
      }, []);

      useEffect(() => {
        const fetchNotifications = async () => {
          if (userInfo && userInfo.email) {
            const user = await getUserByEmail(userInfo.email);
            if (user) {
              const unreadNotifications = await getUnreadNotifications(user.id);
              setNotifications(unreadNotifications);
            }
          }
        };
    
        fetchNotifications();
    
        const notificationInterval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    
        return () => clearInterval(notificationInterval);
      }, [userInfo]);
      useEffect(() => {
        const fetchUserBalance = async () => {
          if (userInfo && userInfo.email) {
            const user = await getUserByEmail(userInfo.email);
            if (user) {
              const userBalance = await getUserBalance(user.id);
              setBalance(userBalance);
            }
          }
        };
    
        fetchUserBalance();
    
        const handleBalanceUpdate = (event: CustomEvent) => {
          setBalance(event.detail);
        };
    
        window.addEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    
        return () => {
          window.removeEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
        };
      }, [userInfo]);

      const login = async () => {
        if (!web3auth) {
          console.log("web3auth not initialized yet");
          return;
        }
        try {
          const web3authProvider = await web3auth.connect();
          setProvider(web3authProvider);
          setLoggedIn(true);
          const user = await web3auth.getUserInfo();
          setUserInfo(user);
          if (user.email) {
            localStorage.setItem('userEmail', user.email);
            try {
              await createUser(user.email, user.name || 'Anonymous User');
            } catch (error) {
              console.error("Error creating user:", error);
              // Handle the error appropriately, maybe show a message to the user
            }
          }
        } catch (error) {
          console.error("Error during login:", error);
        }
      };
      const logout=async()=>{
        if(!web3auth){
          console.log("web3auth not initialized yet");
          return;
        }
        try{
          await  web3auth.logout();
          setProvider(null);
          setLoggedIn(false);
          setUserInfo(null);
          localStorage.removeItem('userEmail');

        }catch(error){
          console.error("Error during logout:",error)
        }
      }

      const getUserInfo=async()=>{
        if(web3auth.connected){
          const user=await web3auth.getUserInfo();
          setUserInfo(user);
          if(user.email){
            localStorage.setItem('userEmail',user.email);
            try{
              await createUser(user.email,user.name || 'Anonymous User');

            }catch(error){
              console.error("Error creating user:",error);
            }
          }

        }
      };
}