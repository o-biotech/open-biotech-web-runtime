import { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { EaCLicenseAsCode } from '@fathym/eac';
import { UserEaCLicense } from '@fathym/eac/api';
import { Action, ActionGroup, ActionStyleTypes, classSet, SlideToggle } from '@o-biotech/atomic';
import { loadStripe } from 'npm:@stripe/stripe-js';
import { callToActionStyles } from '../../../components/styles/actions.tsx';
import { RenewIcon } from '../../../../build/iconset/icons/RenewIcon.tsx';

export const IsIsland = true;

export type LicensesProps = JSX.HTMLAttributes<HTMLDivElement> & {
  license: EaCLicenseAsCode;

  licLookup: string;

  stripePublishableKey: string;

  userLicense?: UserEaCLicense;
};

export default function Licenses(props: LicensesProps) {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [activePlan, setActivePlan] = useState(undefined as string | undefined);

  const [clientSecret, setClientSecret] = useState(
    undefined as string | undefined,
  );

  const [isMonthly, setIsMonthly] = useState(true);

  const [submit, setSubmit] = useState<
    { Submit: (e: SubmitEvent) => void } | undefined
  >(undefined);

  const plans = Object.keys(props.license.Plans)
    .map((planLookup) => {
      const plan = props.license.Plans[planLookup];

      const _planDetails = plan.Details!;

      const prices = Object.keys(plan.Prices).map((priceLookup) => {
        const price = plan.Prices[priceLookup];

        return {
          Lookup: priceLookup,
          ...price.Details!,
        };
      });

      return prices.map((price) => {
        return {
          Lookup: `${planLookup}-${price.Interval}`,
          PlanLookup: planLookup,
          PriceLookup: price.Lookup,
          Name: plan.Details!.Name!,
          Description: plan.Details!.Description!,
          Amount: price.Value,
          Interval: price.Interval,
          Featured: plan.Details!.Featured,
          Features: plan.Details!.Features,
        };
      });
    })
    .flatMap((p) => p);

  const intervalPlans = plans.filter(
    (p) => p.Interval === (isMonthly ? 'month' : 'year'),
  );

  const activateMonthly = async () => {
    setIsMonthly(!isMonthly);

    if (activePlan) {
      await activatePlan(activePlan, !isMonthly);
    }
  };

  const activatePlan = async (planLookup: string, isMonthly: boolean) => {
    const interval = isMonthly ? 'month' : 'year';

    console.log(interval);

    const _planKey = `${planLookup}-${interval}`;

    const plan = plans.find((p) => p.Lookup === _planKey)!;

    setLoading(true);

    const resp = await fetch('/api/o-biotech/licensing/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        LicenseLookup: props.licLookup,
        PlanLookup: planLookup,
        PriceLookup: plan.PriceLookup,
      } as UserEaCLicense),
    });

    const licData = await resp.json();

    if (licData?.Subscription) {
      setTimeout(() => setLoading(false), 0);

      setClientSecret(
        licData.Subscription.latest_invoice.payment_intent.client_secret,
      );

      setActivePlan(planLookup);
    }
  };

  useEffect(() => {
    const configure = async () => {
      setError('');

      const stripe = await loadStripe(props.stripePublishableKey);

      const elements = stripe!.elements({
        clientSecret,
        appearance: {},
      });

      const paymentElement = elements.create('payment');

      paymentElement.mount('#payment-element');

      const returnUrl = new URL(location.pathname, location.origin);

      setSubmit({
        Submit: (e: SubmitEvent) => {
          e.preventDefault();

          const submit = async () => {
            const { error } = await stripe!.confirmPayment({
              //`Elements` instance that was used to create the Payment Element
              elements,
              confirmParams: {
                return_url: returnUrl.toString(),
              },
            });

            if (error) {
              setError(error.message!);
            }
          };

          submit();
        },
      });
    };

    if (clientSecret) {
      configure();
    }
  }, [clientSecret]);

  return (
    <>
      <div class='flex flex-row max-w-sm mx-auto justify-center'>
        <span class='mx-4'>Monthly</span>

        <SlideToggle checked={!isMonthly} onChange={() => activateMonthly()}>
          <span class='mx-4'>Yearly</span>
        </SlideToggle>
      </div>

      {activePlan && (
        <div class='flex flex-row max-w-sm mx-auto justify-center'>
          <Action
            actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
            onClick={() => setActivePlan(undefined)}
          >
            Change License {'>'}
          </Action>
        </div>
      )}

      <div
        {...props}
        class={classSet(
          [
            '-:grid -:px-8 -:gap-10 -:text-zinc-800 -:mt-10',
            activePlan ? '-:lg:grid-cols-2' : '-:lg:grid-cols-2',
          ],
          props,
        )}
      >
        {intervalPlans.map((plan) => (
          <>
            {(!activePlan || activePlan == plan.PlanLookup) && (
              <div
                class={classSet([
                  'flex flex-col items-center p-8 rounded-lg shadow-lg max-w-sm relative',
                  plan.Featured
                    ? 'bg-gradient-to-br from-blue-100 via-orange-100 to-purple-100 border-8 border-orange-200'
                    : 'bg-slate-100',
                ])}
              >
                {plan.Featured && (
                  <>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                      aria-hidden='true'
                      class='w-20 h-20 absolute -top-11 -left-11 fill-red-400'
                    >
                      <path
                        fill-rule='evenodd'
                        d='M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z'
                        clip-rule='evenodd'
                      >
                      </path>
                    </svg>

                    <p class='mono text-sm absolute -top-4 bg-red-400 text-zinc-100 py-0.5 px-2 font-bold tracking-wider rounded text-uppercase'>
                      {plan.Featured}
                    </p>
                  </>
                )}

                <div>
                  <h2 class='font-extrabold text-3xl text-center mb-2'>
                    {plan.Name}
                  </h2>

                  <p class='opacity-60 text-center'>{plan.Description}</p>

                  <div class='flex flex-col items-center my-8'>
                    <p class='font-extrabold text-4xl'>${plan.Amount}</p>

                    <p class='text-sm opacity-60'>/{plan.Interval}</p>
                  </div>
                </div>

                <div class='flex flex-col gap-1'>
                  {plan.Features &&
                    plan.Features.map((feature) => (
                      <p class='flex items-center text-sm'>
                        &#x1F5F8;
                        <b class='ml-2'>{feature}</b>
                      </p>
                    ))}

                  {activePlan !== plan.PlanLookup && (
                    <div class='flex justify-center mt-8'>
                      <ActionGroup class='mt-8 flex-col'>
                        <>
                          <Action
                            type='submit'
                            class={classSet(
                              [
                                'w-full md:w-auto text-white font-bold m-1 py-2 px-4 rounded focus:outline-none shadow-lg',
                              ],
                              callToActionStyles.props,
                            )}
                            onClick={() => activatePlan(plan.PlanLookup, isMonthly)}
                          >
                            Get Started
                          </Action>
                        </>
                      </ActionGroup>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ))}

        {activePlan && clientSecret && (
          <form id='payment-form' onSubmit={(e) => submit?.Submit(e)}>
            {/* <form id="payment-form" onSubmit={(e) => submitPayment?.(e)}> */}
            <div id='payment-element'></div>

            {!loading
              ? (
                <ActionGroup class='mt-8 flex-col'>
                  <>
                    <Action
                      id='submit'
                      type='submit'
                      class={classSet(
                        [
                          'w-full md:w-auto text-white font-bold m-1 py-2 px-4 rounded focus:outline-none shadow-lg',
                        ],
                        callToActionStyles.props,
                      )}
                    >
                      Subscribe
                    </Action>
                  </>
                </ActionGroup>
              )
              : <RenewIcon class='w-20 h-20 text-blue-500 animate-spin inline-block' />}

            <div>{error}</div>
          </form>
        )}
      </div>
    </>
  );
}
