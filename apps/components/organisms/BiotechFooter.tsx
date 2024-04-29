import { classSet, Footer, FooterProps } from '@o-biotech/atomic';

export function BiotechFooter(props: FooterProps) {
  return (
    <Footer
      companyName='Fathym OpenBiotech'
      companyDescription='Deliver Biotech applications with ease, share with the masses.'
      class={classSet(['![&_a]:text-white'], props)}
      nav={[
        {
          href: '/',
          class: 'px-2 py-1 text-gray-400 hover:text-white md:mx-2',
          'data-eac-bypass-base': true,
          children: 'Home',
        },
        {
          href: '/',
          class: 'px-2 py-1 text-gray-400 hover:text-white md:mx-2',
          children: 'Dashboard',
        },
        // {
        //   href: '/products',
        //   class: 'px-2 py-1 text-gray-400 hover:text-white md:mx-2',
        //   children: 'Products',
        // },
        // {
        //   href: '/services',
        //   class: 'px-2 py-1 text-gray-400 hover:text-white md:mx-2',
        //   children: 'Services',
        // },
        // {
        //   href: '/about-us',
        //   class: 'px-2 py-1 text-gray-400 hover:text-white md:mx-2',
        //   children: 'About Us',
        // },
        {
          href: 'mailto:support@fathym.com',
          // href: '/contact',
          class: 'px-2 py-1 text-gray-400 hover:text-white md:mx-2',
          children: 'Contact',
        },
      ]}
      {...props}
    />
  );
}
