import { Redirect } from 'expo-router';

/** The old "Uşaqlar" section page; the games list now lives on the home screen. */
export default function ChildrenRedirect() {
  return <Redirect href="/" />;
}
