import { EyeIcon, TableCellsIcon } from "@heroicons/react/24/outline";
import AirTank from "@/icons/air-tank.svg";
import React from "react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
        Marshalls Dive station tracking site
      </h1>
      <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
        A simple site for keeping track of service that was done at the fill
        station
      </p>
      <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
        <div className="-mx-6 grid grid-cols-2 gap-0.5 overflow-hidden sm:mx-0 sm:rounded-2xl md:grid-cols-3">
          <a
            href="fills"
            className="bg-gray-400/5 p-6 sm:p-10 flex flex-col gap-2 items-center justify-between cursor-pointer hover:bg-gray-400/10 transition"
          >
            <Image
              src={AirTank}
              alt="Air Tank"
              className="max-h-12 w-full object-contain"
            />
            <p>Fills</p>
          </a>
          <a
            href="visual"
            className="bg-gray-400/5 p-6 sm:p-10 flex flex-col gap-2 items-center justify-between cursor-pointer hover:bg-gray-400/10 transition"
          >
            <EyeIcon />
            <p>Visual</p>
          </a>
          <a
            href="history"
            className="bg-gray-400/5 p-6 sm:p-10 flex flex-col gap-2 items-center justify-between cursor-pointer hover:bg-gray-400/10 transition"
          >
            <TableCellsIcon />
            <p>History</p>
          </a>
        </div>
      </div>
    </div>
  );
}
