import { AuthTokenProvider } from "@/store/authtoken-context";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <AuthTokenProvider>
      <Component {...pageProps} />
    </AuthTokenProvider>
  );
}
