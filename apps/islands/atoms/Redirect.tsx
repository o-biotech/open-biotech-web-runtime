export const IsIsland = true;

export type RedirectProps = {
  interval: number;

  redirect?: string;
};

export default function Redirect(props: RedirectProps) {
  setTimeout(() => {
    if (location) {
      if (props.redirect) {
        location.href = props.redirect;
      } else {
        location.reload();
      }
    }
  }, props.interval);

  return <></>;
}
