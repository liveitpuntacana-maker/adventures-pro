import Image from "next/image";
import { groq } from "next-sanity";

import { client } from "@/sanity/lib/client";
import { SANITY_TAGS, sanityCache } from "@/lib/sanityCache";
import { urlFor } from "@/sanity/lib/image";
import { type AppLocale } from "@/i18n/routing";

type Member = {
  _id: string;
  name: string;
  role: string;
  bio: string;
  languages?: string;
  image?: unknown;
};

const teamMembersQuery = groq`*[_type == "teamMember"] | order(_createdAt asc){
  _id,
  "name": coalesce(select($locale == "fr-ca" => name.frCA, name[$locale]), name.en, name),
  "role": coalesce(select($locale == "fr-ca" => role.frCA, role[$locale]), role.en, role),
  "bio": coalesce(select($locale == "fr-ca" => bio.frCA, bio[$locale]), bio.en, bio),
  languages,
  image
}`;

type TeamGridProps = {
  locale?: AppLocale;
  teamTagline?: string | null;
  sectionSubtitle?: string | null;
};

export default async function TeamGrid({
  locale = "en",
  teamTagline,
  sectionSubtitle,
}: TeamGridProps) {
  const team = await client.fetch<Member[]>(
    teamMembersQuery,
    { locale },
    sanityCache([SANITY_TAGS.teamMember]),
  );
  const heading = teamTagline?.trim() || "Our Team";
  const subtitle = sectionSubtitle?.trim() || "";

  if (!team.length) {
    return (
      <section className="mt-0 pt-0">
        <h2 className="mb-8 text-center text-3xl font-semibold tracking-tight text-[#0a192f] md:text-4xl">
          {heading}
        </h2>
        {subtitle ? (
          <p className="mx-auto mb-8 max-w-3xl text-center text-base leading-relaxed text-slate-600">
            {subtitle}
          </p>
        ) : null}
        <p className="mb-8 mt-0 text-center text-sm font-medium uppercase tracking-[0.16em] text-cyan-700">
          Cargando
        </p>
        <div className="mt-0 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={index}
              className="rounded-3xl bg-white p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            >
              <div className="w-full overflow-hidden rounded-3xl">
                <div className="h-[420px] w-full animate-pulse bg-slate-200" />
                <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-cyan-400" />
              </div>
              <div className="space-y-3 p-6">
                <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                <div className="h-16 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-0 pt-0">
      <h2 className="mb-8 text-center text-3xl font-semibold tracking-tight text-[#0a192f] md:text-4xl">
        {heading}
      </h2>
      {subtitle ? (
        <p className="mx-auto mb-8 max-w-3xl text-center text-base leading-relaxed text-slate-600">
          {subtitle}
        </p>
      ) : null}
      <div className="mt-0 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {team.map((member) => (
          <article
            key={member._id}
            className="group rounded-3xl bg-white p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className="w-full overflow-hidden rounded-3xl bg-slate-100">
              {member.image ? (
                <Image
                  src={urlFor(member.image).width(1000).url()}
                  alt={member.name}
                  width={1000}
                  height={1200}
                  className="h-auto w-full object-contain transition-all duration-300 group-hover:brightness-105"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              ) : (
                <div className="h-[420px] w-full bg-slate-200" />
              )}
              <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-cyan-400" />
            </div>
            <div className="p-6 md:p-7">
              <h3 className="text-xl font-semibold tracking-tight text-[#0a192f]">
                {member.name}
              </h3>
              <p className="mt-1 text-sm font-semibold text-cyan-800">
                {member.role}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                {member.bio}
              </p>
              {member.languages ? (
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {member.languages}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
