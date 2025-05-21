import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login');
  // Note: redirect() must be called outside of a try/catch block.
  // It's also good practice to return null or a simple component if there's any code after it,
  // though in this case, execution stops.
  return null; 
}
