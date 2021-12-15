# Kubecost AddOn for AWS SSP CDK Platform

This repository contains the source code for the Kubecost AddOn npm module.

`ssp-amazon-eks` is a [CDK](https://aws.amazon.com/cdk/) construct that makes it easy for customers to build and deploy a Shared Services Platform (SSP) on top of [Amazon EKS](https://aws.amazon.com/eks/).

## Installation

Using [npm](https://npmjs.org):

```bash
$ npm install @kubecost/kubecost-ssp-addon
```

## Usage

```javascript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as ssp from '@aws-quickstart/ssp-amazon-eks';
import { KubecostAddOn } from '@kubecost/kubecost-ssp-addon';

const app = new cdk.App();

// Include the Kubecost AddOn in your list
// Grab your token from kubecost.com/install (it's free)
const addOns: Array<ssp.ClusterAddOn> = [
    new KubecostAddOn({kubecostToken : 'kubecost_token'}),
];

const account = 'account_number'
const region = 'aws_region'
const props = { env: { account, region } }
new ssp.EksBlueprint(app, { id: 'cluster_id', addOns}, props)
```

## `KubecostAddOn` Options (props)

#### `namespace: string` (optional)

The namespace where Kubecost will be installed. Defaults to `kubecost`.

#### `kubecostToken: string` (optional)

You may get one [here](https://kubecost.com/install).

#### `version: string` (optional)

The `cost-analyzer` helm chart version. Defaults to the latest version specified in this repo (`1.88.1` at the time of writing).

####  `values?: { [key: string]: any }` (optional)

Custom values to pass to the chart. Config options: https://github.com/kubecost/cost-analyzer-helm-chart/blob/master/README.md#config-options 

## Support

If you have any questions about Kubecost, catch us [on Slack](https://docs.kubecost.com/support-channels.html)!

## License

The Kubecost SSP AddOn is licensed under the Apache 2.0 license.
