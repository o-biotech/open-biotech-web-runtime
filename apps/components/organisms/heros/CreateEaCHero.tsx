import { DisplayStyleTypes, Hero, HeroProps, HeroStyleTypes } from '@o-biotech/atomic';

export type CreateEaCHeroProps = HeroProps;

export default function CreateEaCHero(props: CreateEaCHeroProps) {
  return (
    <Hero
      title='Create Enterprise'
      callToAction='All-in-one workspace for seamless workload organization. Effortlessly manage resources, data, and teams from a single, convenient hub.'
      class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
      heroStyle={HeroStyleTypes.None}
      displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      {...props}
    >
    </Hero>
  );
}
