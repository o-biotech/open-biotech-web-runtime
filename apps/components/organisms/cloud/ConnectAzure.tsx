import { JSX } from 'preact';
import { useState } from 'preact/hooks';
import { Subscription } from 'npm:@azure/arm-subscriptions';
import { CloudConnectAzureForm } from '@o-biotech/atomic';
import { CloudConnectForms } from './CloudConnectForms.tsx';

export type ConnectAzureProps = JSX.HTMLAttributes<HTMLFormElement> & {
  isConnected: boolean;

  subs: Subscription[];
};

export default function ConnectAzure(props: ConnectAzureProps) {
  return (
    <div class='flex flex-col justify-center'>
      {!props.isConnected
        ? <CloudConnectAzureForm {...props}></CloudConnectAzureForm>
        : <CloudConnectForms {...props} class='px-4' />}
    </div>
  );
}
