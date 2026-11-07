export default function About() {
  return <main className="page detail-page"><article className="markdown-body">
    <h1>About this catalogue</h1>
    <h2>Why sign in?</h2>
    <p>Browsing is public. Sign in with GitHub through Firebase Authentication to save starred events and see your personal list and calendar across devices. GitHub handles your password; this site does not receive it. Firebase maintains your signed-in session. We request no additional GitHub permissions.</p>
    <p>Your event keys and the time you starred them are stored in Cloud Firestore under your Firebase user ID. Security rules restrict access to your account. Unstar an event to delete its saved record, or sign out on a shared device.</p>
    <h2>How events are collected</h2>
    <p>AI-assisted searches collect conferences and hackathons from organizer websites. The catalogue is maintained as public Markdown files. AI can miss changes or make mistakes: check the official event page before registering, paying or travelling. Automated link checks help flag broken or questionable destinations; they do not guarantee that an event’s details are accurate.</p>
    <h2>Contribute an event or description</h2>
    <p>Edit the <a href="https://github.com/zizitop13/upcoming-IT-events/tree/main/content">public content files on GitHub</a>, commit your changes and open a pull request. You can add events, improve descriptions and correct dates or links. Follow the repository’s <a href="https://github.com/zizitop13/upcoming-IT-events/blob/main/AGENTS.md">content guidelines</a>, include official sources and check for an existing event before adding one.</p>
  </article></main>;
}
