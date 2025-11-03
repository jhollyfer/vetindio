import {
  Sidebar as Root,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HomeIcon,
  LogOutIcon,
  ShoppingBagIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { MenuRoute } from "@/lib/entities";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function Sidebar() {
  const { setOpenMobile } = useSidebar();
  const location = useLocation();

  const menu: MenuRoute = [
    {
      title: "Menu",
      items: [
        {
          title: "Início",
          url: "/dashboard",
          icon: HomeIcon,
        },
        {
          title: "Produtos",
          url: "/products",
          icon: ShoppingBagIcon,
        },
        {
          title: "Categorias",
          url: "/categories",
          icon: TagIcon,
        },
      ],
    },

    {
      title: "Configurações",
      items: [
        {
          title: "Administradores",
          url: "/administrators",
          icon: UsersIcon,
        },
      ],
    },
  ];

  const router = useRouter();

  const { state } = useSidebar();

  const signOut = useMutation({
    mutationFn: async function () {
      const route = "/authentication/sign-out";
      console.log(route);
    },
    onSuccess() {
      router.navigate({
        to: "/",
        replace: true,
      });
    },
    onError(error) {
      if (error instanceof AxiosError) {
        const data = error.response?.data;

        // 401 - AUTHENTICATION_REQUIRED
        if (data?.code === 401 && data?.cause === "AUTHENTICATION_REQUIRED") {
          toast.error(data?.message ?? "Authentication required");
        }

        // 500 - SERVER_ERROR
        if (data?.code === 500) {
          toast.error(data?.message ?? "Erro interno do servidor");
        }
      }

      console.error(error);
    },
  });

  return (
    <Root collapsible="icon" variant="floating">
      <SidebarContent>
        {menu?.map((props) => (
          <SidebarGroup key={props.title}>
            <SidebarGroupLabel>{props.title}</SidebarGroupLabel>
            <SidebarMenu>
              {props.items.map((item) => {
                const to = String(item?.url?.toString() ?? "/").replace(
                  /\/$/,
                  ""
                );

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="group data-[active=true]:bg-primary data-[active=true]:text-primary-foreground "
                      isActive={location?.pathname?.includes(to)}
                      tooltip={item.title}
                    >
                      <Link to={to} onClick={() => setOpenMobile(false)}>
                        {item.icon && (
                          <item.icon
                            className="text-primary group-data-[active=true]:text-primary-foreground"
                            width={32}
                          />
                        )}
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge className="rounded-full px-1  text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
        <SidebarGroup>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => signOut.mutateAsync()}
                    className="w-full rounded-none cursor-pointer"
                  >
                    <LogOutIcon className="text-primary" />
                    <span>Sair</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </TooltipTrigger>
            {state === "collapsed" && (
              <TooltipContent side="right">Sair</TooltipContent>
            )}
          </Tooltip>
        </SidebarGroup>
      </SidebarContent>
    </Root>
  );
}
