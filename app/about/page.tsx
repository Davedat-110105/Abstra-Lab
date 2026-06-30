import { disciplines, faculty, leadership, partners, programs, values } from "../content";
import { bg, PageHero, Rows } from "../page-sections";

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Engineering students building real hardware, documented in the open."
        lede="Founded in 2025, Astra Labs is a student-run engineering group at Seneca Polytechnic. The mission is specific: build Pioneer for Launch Canada 2026, and leave behind a complete record of how we did it."
        image="/images/aboutus.jpg"
        meta={["Founded 2025", "Seneca Polytechnic", "Launch Canada 2026"]}
      />

      <section className="sx-page-body">
        <div className="wrap">
          <div className="sx-page-intro range-ticks range-ticks--section">
            <p className="section-eyebrow">Goals</p>
            <h2>Build the vehicle, fund the work, and compete with traceable documentation.</h2>
          </div>
          <Rows
            items={[
              ["01", "Connect the crew", "Unite Seneca students around launch-ready technical work. Shared accountability, shared tooling, shared data."],
              ["02", "Teach the process", "Make aerospace engineering, systems thinking, safety protocols, and documentation visible to new members at every skill level."],
              ["03", "Raise the program", "Secure funding for vehicle materials, ground-test equipment, travel, and competition fees. Sponsorship is a core skill, not an afterthought."],
              ["04", "Show the evidence", "Represent Seneca at Launch Canada with a student-built vehicle and a complete traceable record of every design decision."],
            ]}
          />
        </div>
      </section>

      <section className="sx-page-body sx-page-body--tight">
        <div className="wrap">
          <p className="section-eyebrow">Leadership</p>
          <div className="table-wrap" style={{ marginTop: 24 }}>
            <table className="site-table">
              <thead>
                <tr><th>Name</th><th>Role</th><th>Responsibility</th></tr>
              </thead>
              <tbody>
                {leadership.map((person) => (
                  <tr key={person.name}>
                    <td>{person.name}</td>
                    <td>{person.role}</td>
                    <td>{person.responsibility}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="sx-page-body">
        <div className="wrap">
          <div className="sx-page-intro">
            <p className="section-eyebrow">Core values</p>
            <h2>How we work together</h2>
          </div>
          <Rows items={values.map(([name, text]) => ["Astra", name, text])} />
        </div>
      </section>

      <section className="sx-split">
        <div className="sx-split__media" style={bg("/images/field/team-outdoor-01.jpg")} role="img" aria-label="Astra Labs members during a field session" />
        <div className="sx-split__copy range-ticks range-ticks--section">
          <p className="section-eyebrow">Institutional support</p>
          <h2>Built with faculty and campus partners.</h2>
          <p>Faculty advisors: {faculty.join(", ")}.</p>
          <p>Supported by {partners.join(" and ")}.</p>
        </div>
      </section>

      <section className="sx-page-body sx-page-body--tight">
        <div className="wrap">
          <div className="discipline-rail">
            <div className="range-ticks range-ticks--section">
              <p className="section-eyebrow">Technical disciplines</p>
              <h3>Aerospace work spans many specialities</h3>
              <p>{disciplines.join(", ")}.</p>
            </div>
            <span>Relevant programs: {programs.join(", ")}</span>
          </div>
        </div>
      </section>
    </>
  );
}
