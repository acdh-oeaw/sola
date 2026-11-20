import type { Metadata } from "next";
import { type JSX, Fragment } from "react";

import { type ContentTeamMember, getContentPage, getContentTeamMembers } from "@/api/content";
import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import { getLocale } from "@/lib/i18n/getLocale";
import { Email } from "@/modules/icons/Email";
import { Globe } from "@/modules/icons/Globe";
import { Phone } from "@/modules/icons/Phone";
import { createMetadata } from "@/modules/metadata/createMetadata";
import { Container } from "@/modules/ui/Container";

const labels = {
	en: {
		page: {
			title: "Team",
		},
		data: {
			phone: "Phone",
			email: "Email",
			website: "Website",
		},
		group: {
			current: "Researchers",
			former: "Former team members",
			acdh: "IT-Team",
		},
	},
	de: {
		page: {
			title: "Team",
		},
		data: {
			phone: "Telefon",
			email: "Email",
			website: "Website",
		},
		group: {
			current: "Wissenschaftliche Mitarbeiter*innen",
			former: "Ehemalige Mitarbeiterinnen",
			acdh: "IT-Team",
		},
	},
} as const;

type ContentPageMetadata = {
	title: string;
};

interface TeamPageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: TeamPageProps): Promise<Metadata> {
	const locale = await getLocale(props.params);

	return createMetadata({ locale, title: labels[locale].page.title, path: "/team" });
}

/**
 * Team page.
 */
export default async function TeamPage(props: TeamPageProps): Promise<JSX.Element> {
	const locale = await getLocale(props.params);
	const t = labels[locale];

	const page = await getContentPage<ContentPageMetadata>("team", locale);
	const team = await getContentTeamMembers(locale);

	const groupedTeamMembers: Record<string, Array<ContentTeamMember>> = {};
	team.forEach((member) => {
		(groupedTeamMembers[member.group] ??= []).push(member);
	});

	return (
		<Container as="main">
			<div className="prose">
				<h1>{page.metadata.title}</h1>
				<div dangerouslySetInnerHTML={{ __html: page.html }} />
			</div>
			<div className="space-y-16">
				{Object.entries(groupedTeamMembers).map(([group, teamMembers]) => {
					const sorted = teamMembers.sort((a, b) => {
						return a.boss === true
							? -1
							: b.boss === true
								? 1
								: a.lastName.localeCompare(b.lastName);
					});
					return (
						<div key={group}>
							<h2 className="my-4 text-2xl font-bold text-gray-700">
								{t.group[group as "acdh" | "current" | "former"]}
							</h2>
							<ul className="my-8 space-y-10">
								{sorted.map((teamMember) => {
									return (
										<li key={teamMember.id}>
											<TeamMember teamMember={teamMember} t={t.data} />
										</li>
									);
								})}
							</ul>
						</div>
					);
				})}
			</div>
		</Container>
	);
}

function TeamMember({
	teamMember,
	t,
}: {
	teamMember: ContentTeamMember;
	t: (typeof labels)[SiteLocale]["data"];
}) {
	const hasWebsite = teamMember.website !== undefined && teamMember.website.length > 0;
	const { email, phone } = teamMember;
	const hasEmail = email !== undefined && email.length > 0;
	const hasPhone = phone !== undefined && phone.length > 0;
	const hasInfo = hasWebsite || hasEmail || hasPhone;

	return (
		<Fragment>
			<h3 className="my-4 text-xl font-bold text-gray-700">
				{[teamMember.firstName, teamMember.lastName].join(" ")}
			</h3>
			<p className="my-4 leading-7 text-gray-700">{teamMember.biography}</p>
			{hasInfo ? (
				<dl className="flex flex-col my-3 space-y-2 text-gray-500 md:space-y-0 md:flex-row md:space-x-6">
					{hasWebsite ? (
						<div>
							<dt className="sr-only">{t.website}</dt>
							<dd className="flex items-center space-x-1.5">
								<Globe />
								<a
									className="transition hover:text-gray-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
									href={teamMember.website}
									rel="noopener noreferrer"
									target="_blank"
								>
									{t.website}
								</a>
							</dd>
						</div>
					) : null}
					{hasEmail ? (
						<div>
							<dt className="sr-only">{t.email}</dt>
							<dd className="flex items-center space-x-1.5">
								<Email />
								<a
									className="transition hover:text-gray-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
									href={`mailto:${email}`}
									rel="noopener noreferrer"
									target="_blank"
								>
									{email}
								</a>
							</dd>
						</div>
					) : null}
					{hasPhone ? (
						<div>
							<dt className="sr-only">{t.phone}</dt>
							<dd className="flex items-center space-x-1.5">
								<Phone />
								<a
									className="transition hover:text-gray-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
									href={`tel:${phone}`}
									rel="noopener noreferrer"
									target="_blank"
								>
									{phone}
								</a>
							</dd>
						</div>
					) : null}
				</dl>
			) : null}
		</Fragment>
	);
}
