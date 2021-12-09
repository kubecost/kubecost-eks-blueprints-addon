import { ClusterAddOn, ClusterInfo } from '@aws-quickstart/ssp-amazon-eks';
import { Construct } from '@aws-cdk/core';

export interface KubecostAddOnProps {
    /**
     * Namespace for the add-on.
    */
    namespace?: string;

    /**
     * Token obtained from https://www.kubecost.com/install
    */
    kubecostToken?: string;

    /**
     * Helm chart version
    */
    version?: string;

    /**
     * Values to pass to the chart.
     * Config options: https://github.com/kubecost/cost-analyzer-helm-chart/blob/master/README.md#config-options 
    */
    values?: {
        [key: string]: any;
    };
}

const defaultProps: KubecostAddOnProps = {
    namespace: "kubecost",
    version: "1.88.1",
};

/**
 * Utility for setting individual values by name
 * https://github.com/aws-quickstart/ssp-amazon-eks/blob/main/lib/utils/object-utils.ts
 */
const setPath = (obj : any, path: string, val: any) => { 
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const lastObj = keys.reduce((obj, key) => 
        obj[key] = obj[key] || {}, 
        obj); 
    lastObj[lastKey] = val;
};

export class KubecostAddOn implements ClusterAddOn {

    readonly options: KubecostAddOnProps;

    constructor(props?: KubecostAddOnProps) {
        this.options = { ...defaultProps, ...props };
    }

    deploy(clusterInfo: ClusterInfo): Promise<Construct> {

        const props = this.options;

        const values = { ...props.values ?? {}};

        if (props.kubecostToken) {
            setPath(values, "kubecostToken", props.kubecostToken);
        }

        const kubecostHelmChart = clusterInfo.cluster.addHelmChart("kubecost", {
            chart: "kubecost/cost-analyzer",
            release: "kubecost/cost-analyzer",
            repository: "https://kubecost.github.io/cost-analyzer/",
            namespace: props.namespace,
            version: props.version,
            values
        });
        return Promise.resolve(kubecostHelmChart);
    }
}
