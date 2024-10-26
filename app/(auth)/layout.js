import { ClerkProvider, OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "../globals.css";

export const metadata = {
  title: "Threads",
  description: "A Next.js meta Threads Application",
};

const inter = Inter({ subsets: ["latin"] });

const layout = ({ children }) => {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en">
        <body className='bg-dark-1'>{children}</body>
      </html>
    </ClerkProvider>
  );
};

export default layout;
