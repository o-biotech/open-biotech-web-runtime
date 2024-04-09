import { DisplayStyleTypes, Hero, HeroProps, HeroStyleTypes } from '@o-biotech/atomic';

export type CreateEaCHeroProps = HeroProps & {
  isFirst?: boolean;
};

export default function CreateEaCHero(props: CreateEaCHeroProps) {
  const cta = props.isFirst
    ? "You have not setup your initial enterprise, let's get started now."
    : "Let's create a new enterprise.";

  return (
    <Hero
      title='Create Enterprise'
      callToAction={cta}
      class='[&_*]:mx-auto [&>*>*]:w-full bg-[#000028] text-center'
      heroStyle={HeroStyleTypes.None}
      displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      {...props}
    >
    </Hero>
  );
}
