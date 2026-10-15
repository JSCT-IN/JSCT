import { redirect } from 'next/navigation';

export default function MembersRedirectPage() {
  redirect('/console-secure-admin/dashboard');
}
