import * as React from "react";
import Logo from "@/icons/logo.svg";
import Image from "next/image";

export default function LogoIcon() {
  return <Image src={Logo} alt="Logo" className="h-12 w-auto" />;
}
