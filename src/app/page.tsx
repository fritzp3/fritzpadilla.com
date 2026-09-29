// Home page — sections are built in Phase 3. The ids exist now so the nav's
// /#about, /#work and /#contact anchors can be tested.
export default function Home() {
  return (
    <>
      <section className="py-24">
        <h1>Fritz Padilla</h1>
        <p>Home page sections arrive in Phase 3.</p>
      </section>
      {(["about", "work", "contact"] as const).map((id) => (
        <section key={id} id={id} className="min-h-[70vh] border-t border-divider py-16">
          <h2 className="capitalize">{id}</h2>
        </section>
      ))}
    </>
  );
}
