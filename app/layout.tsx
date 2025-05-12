import AuthProvider from "./_components/AuthProvider";
import DefaultLayout from "./_components/DefaultLayout";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DefaultLayout>{children}</DefaultLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
