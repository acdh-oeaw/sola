import excerptMarkdown from '@stefanprobst/remark-excerpt'
import parseYamlFrontmatter from '@stefanprobst/remark-extract-yaml-frontmatter'
import { promises as fs } from 'fs'
import path from 'path'
import toHtml from 'rehype-stringify'
import withFrontmatter from 'remark-frontmatter'
import fromMarkdown from 'remark-parse'
import toHast from 'remark-rehype'
import toMarkdown from 'remark-stringify'
import stripMarkdown from 'strip-markdown'
import { unified } from 'unified'
import YAML from 'yaml'

import type { SiteLocale } from '@/lib/i18n/getCurrentLocale'

const basePath = path.resolve('content')
const dataBasePath = path.join(basePath, 'data')
const pageBasePath = path.join(basePath, 'pages')
const postBasePath = path.join(basePath, 'posts')

const pageExtension = '.md'
const dataExtension = '.yml'
const postExtension = '.md'

/**
 * Markdown processor.
 *
 * Supports YAML frontmatter. HTML in markdown is intentionally not supported.
 */
const md = unified()
  .use(fromMarkdown)
  .use(withFrontmatter)
  .use(parseYamlFrontmatter)
  .use(toHast)
  .use(toHtml)

/**
 * Markdown processor for plain text excerpt.
 *
 * Supports YAML frontmatter.
 */
const excerpt = unified()
  .use(fromMarkdown)
  .use(withFrontmatter)
  .use(parseYamlFrontmatter)
  .use(excerptMarkdown, { maxLength: 280 })
  .use(stripMarkdown)
  .use(toMarkdown)

export interface CmsPage<T extends Record<string, unknown>> {
  id: string
  html: string
  metadata: T
}

/**
 * Returns page contents as HTML and JSON metadata.
 */
export async function getCmsPage<T extends Record<string, unknown>>(
  id: string,
  locale: SiteLocale,
): Promise<CmsPage<T>> {
  const filePath = path.join(pageBasePath, locale, id + pageExtension)
  const fileContents = await fs.readFile(filePath, { encoding: 'utf-8' })
  const processed = await md.process(fileContents)

  const html = String(processed)
  const { frontmatter: metadata } = processed.data as {
    frontmatter: T
  }

  return { id, html, metadata }
}

export interface CmsTeamMember {
  id: string
  firstName: string
  lastName: string
  boss?: boolean
  group: 'acdh' | 'current' | 'former'
  title?: string
  affiliation?: string
  image?: string
  email?: string
  phone?: string
  website?: string
  biography: string
}

/**
 * Returns team member data as JSON.
 */
export async function getCmsTeamMembers(locale: SiteLocale): Promise<Array<CmsTeamMember>> {
  const folderPath = path.join(dataBasePath, 'team', locale)
  const folderContents = await fs.readdir(folderPath)

  const data: Array<CmsTeamMember> = await Promise.all(
    folderContents.map(async (file) => {
      const filePath = path.join(folderPath, file)
      const fileContents = await fs.readFile(filePath, { encoding: 'utf-8' })
      const processed = YAML.parse(fileContents)
      return { id: file.slice(0, -dataExtension.length), ...processed }
    }),
  )

  data.sort((a, b) => {
    return a.lastName.localeCompare(b.lastName)
  })

  return data
}

export type CmsPostBaseMetadata = {
  title: string
  date: string
  abstract: string
}

export interface CmsPostBase {
  id: string
  metadata: CmsPostBaseMetadata
}

/**
 * Returns list of posts with abstracts.
 */
export async function getCmsPostsOverview(locale: SiteLocale): Promise<Array<CmsPostBase>> {
  const folderPath = path.join(postBasePath, locale)
  const folderContents = await fs.readdir(folderPath)

  const data: Array<CmsPostBase> = await Promise.all(
    folderContents.map(async (file) => {
      const filePath = path.join(folderPath, file)
      const fileContents = await fs.readFile(filePath, { encoding: 'utf-8' })
      const processed = await excerpt.process(fileContents)

      const abstract = String(processed)
      const { frontmatter } = processed.data as {
        frontmatter: CmsPostMetadata
      }

      const metadata = {
        title: frontmatter.shortTitle ?? frontmatter.title,
        date: frontmatter.date,
        abstract: frontmatter.abstract ?? abstract,
      }

      return { id: file.slice(0, -postExtension.length), metadata }
    }),
  )

  data.sort((a, b) => {
    return a.metadata.date > b.metadata.date ? -1 : 1
  })

  return data
}

export type CmsPostMetadata = {
  title: string
  shortTitle?: string
  date: string
  abstract?: string
  attachments?: Array<{ label: string; file: string }>
  gallery?: Array<{ alt?: string; image: string }>
}

export interface CmsPost {
  id: string
  html: string
  metadata: CmsPostMetadata
}

/**
 * Returns list of posts with abstracts.
 */
export async function getCmsPostById(id: string, locale: SiteLocale): Promise<CmsPost> {
  const filePath = path.join(postBasePath, locale, id + postExtension)
  const fileContents = await fs.readFile(filePath, { encoding: 'utf-8' })
  const processed = await md.process(fileContents)

  const html = String(processed)
  const { frontmatter: metadata } = processed.data as {
    frontmatter: CmsPostMetadata
  }

  return { id, html, metadata }
}

/**
 * Returns all post ids.
 */
export async function getCmsPostIds(locale: SiteLocale): Promise<Array<string>> {
  const folderPath = path.join(postBasePath, locale)
  const folderContents = await fs.readdir(folderPath)
  return folderContents.map((file) => {
    return file.slice(0, -postExtension.length)
  })
}
