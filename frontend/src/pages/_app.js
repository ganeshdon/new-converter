import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Your Bank Statement Converter</title>
        <meta name="description" content="Convert your bank statements to Excel/CSV with AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-9H4HVE7C7R"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-9H4HVE7C7R');
            `,
          }}
        />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "o9zb2e89nc");
            `,
          }}
        />
      </Head>
      
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
}
