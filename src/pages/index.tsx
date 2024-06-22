import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import type { ReactNode } from 'react';

import BlueskySvg from '@site/static/icons/bluesky.svg';
import GithubSvg from '@site/static/icons/github.svg';
import DiscordSvg from '@site/static/icons/discord.svg';
import SteamSvg from '@site/static/icons/steam.svg';
import styles from './index.module.css';
import Text from './_index.md';

function SocialLink(props: { url: string, children: ReactNode }) {
  const { url, children } = props;
  return (
    <Link className="button button--link" to={url}>
      {children}
    </Link>
  );
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <SocialLink url="https://bsky.app/profile/did:plc:ivqrehafyybffh7yxmwhf5n5"><BlueskySvg /></SocialLink>
          <SocialLink url="https://github.com/imax9000/"><GithubSvg /></SocialLink>
          <SocialLink url="https://discordapp.com/users/379475972509925377"><DiscordSvg /></SocialLink>
          <SocialLink url="https://steamcommunity.com/profiles/76561198038606383"><SteamSvg /></SocialLink>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      description={`${siteConfig.tagline}`}
      noFooter>
      <HomepageHeader />
      <main className={styles.homepage}>
        <div className="container">
          <div className="row">
            <div>
              <Text className="text--break" />
            </div>
          </div>
          <div className="row row--justify-center">
            <a className="button button--primary button--lg"
              href="https://savelife.in.ua/en/donate-en/"
              target="_blank">Help Ukraine 🇺🇦</a>
          </div>
        </div>
      </main>
    </Layout>
  );
}
