import type { Metadata } from "next";

import { requireUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resources",
  robots: { index: false, follow: false },
};

export default async function DashboardResourcesPage() {
  const user = await requireUser();
  if (!user) return null;
  const isStaff = user.isStaff || user.isSuperuser;

  const materials = await prisma.buildMaterial.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    where: isStaff ? undefined : { published: true },
  });

  const groups = groupByType(materials);

  return (
    <>
      <header className="dash-page-head">
        <div>
          <h1>Resources</h1>
          <p>Hardware, software, docs, and links for the crew.</p>
        </div>
      </header>

      {materials.length ? (
        <div className="dash-groups">
          {groups.map(([type, items]) => (
            <section key={type} className="dash-group">
              <h2 className="dash-group__title">{type}</h2>
              <ul className="dash-list">
                {items.map((item) => (
                  <li key={item.id.toString()} className="dash-list__row">
                    <div className="dash-list__body">
                      <strong>{item.name}</strong>
                      {item.summary ? <p>{item.summary}</p> : null}
                      {item.usedFor ? (
                        <span className="dash-list__sub">Used for: {item.usedFor}</span>
                      ) : null}
                    </div>
                    <div className="dash-list__aside">
                      <span className="dash-list__sub">{item.access || "Members"}</span>
                      {item.purchaseUrl ? (
                        <a
                          href={item.purchaseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dash-list__action"
                        >
                          Open
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="dash-empty">No resources published yet.</p>
      )}
    </>
  );
}

function groupByType<T extends { materialType: string | null }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = (item.materialType || "other").toLowerCase();
    const list = map.get(key) || [];
    list.push(item);
    map.set(key, list);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}
