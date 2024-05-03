import { DisplayStyleTypes, Hero, HeroProps, HeroStyleTypes } from '@o-biotech/atomic';

export interface CloudConnectHeroProps extends HeroProps {
  hideAction?: boolean;
}

export default function CloudConnectHero(props: CloudConnectHeroProps) {
  return (
    <Hero
      title='Cloud Configuration'
      callToAction='Connect to Azure and select cloud automation options.'
      class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center bg-hero-pattern'
      heroStyle={HeroStyleTypes.None}
      displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      {...props}
    >
      {
        /* {!props.hideAction && (
        <Action href="./getting-started/cloud" class="my-8 flex flex-row">
          Connect Cloud
          <ChevronRightIcon class="w-[24px] h-[24px]" />
        </Action>
      )} */
      }
    </Hero>
  );
}
