import Link from "next/link";
import { Fragment } from "react";

export interface Crumb {
  name: string;
  path: string;
}

/** Visual breadcrumb trail. Pair with `breadcrumbSchema` for the JSON-LD. */
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-soft">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <Fragment key={crumb.path}>
              <li>
                {last ? (
                  <span aria-current="page" className="text-ink-faint">
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    href={crumb.path}
                    className="transition-colors hover:text-clay"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
              {!last && (
                <li aria-hidden="true" className="text-ink-faint/60">
                  /
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
