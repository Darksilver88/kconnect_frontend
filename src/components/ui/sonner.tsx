"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          success: '!bg-green-50 !text-green-800 !border-green-200',
          error: '!bg-red-50 !text-red-800 !border-red-200',
          warning: '!bg-yellow-50 !text-yellow-800 !border-yellow-200',
          info: '!bg-blue-50 !text-blue-800 !border-blue-200',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
