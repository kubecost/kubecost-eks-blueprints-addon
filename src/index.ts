import { ClusterAddOn, ClusterInfo } from "@aws-quickstart/eks-blueprints";
import { Construct } from "constructs";

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
   * Helm chart repository.
   * Defaults to the official repo URL.
   */
  repository?: string;

  /**
   * Release name.
   * Defaults to 'kubecost-cost-analyzer'.
   */
  release?: string;

  /**
   * Chart name.
   * Defaults to 'cost-analyzer'.
   */
  chart?: string;

  /**
   * Set to false to use an existing Node Exporter DaemonSet.
   * Note: this requires your existing Node Exporter endpoint to be visible from the namespace where Kubecost is installed.
   * https://github.com/kubecost/docs/blob/main/getting-started.md#using-an-existing-node-exporter
   */
  installPrometheusNodeExporter?: boolean;

  /**
   * Kubecost comes bundled with a Prometheus installation.
   * However, if you wish to integrate with an external Prometheus deployment, provide your local Prometheus service address with this format "http://..svc".
   * Note: integrating with an existing Prometheus is only officially supported under Kubecost paid plans and requires some extra configurations on your Prometheus.
   * https://docs.kubecost.com/custom-prom.html
   */
  customPrometheus?: string;

  /**
   * Values to pass to the chart.
   * Config options: https://github.com/kubecost/cost-analyzer-helm-chart/blob/master/README.md#config-options
   */
  values?: {
    [key: string]: any;
  };
}

const defaultProps: KubecostAddOnProps = {
  repository: "https://kubecost.github.io/cost-analyzer/",
  chart: "cost-analyzer",
  namespace: "kubecost",
  version: "1.92.0",
  release: "kubecost-cost-analyzer",
  installPrometheusNodeExporter: true,
};

/**
 * Utility for setting individual values by name
 * https://github.com/aws-quickstart/ssp-amazon-eks/blob/main/lib/utils/object-utils.ts
 */
const setPath = (obj: any, path: string, val: any) => {
  const keys = path.split(".");
  const lastKey = keys.pop()!;
  const lastObj = keys.reduce((obj, key) => (obj[key] = obj[key] || {}), obj);
  lastObj[lastKey] = val;
};

export class KubecostAddOn implements ClusterAddOn {
  readonly options: KubecostAddOnProps;

  constructor(props?: KubecostAddOnProps) {
    this.options = { ...defaultProps, ...props };
  }

  deploy(clusterInfo: ClusterInfo): Promise<Construct> {
    const props = this.options;

    const values = { ...(props.values ?? {}) };

    if (props.kubecostToken) {
      setPath(values, "kubecostToken", props.kubecostToken);
    }

    if (props.customPrometheus) {
      setPath(values, "prometheus.fqdn", props.customPrometheus);
      setPath(values, "prometheus.enabled", false);
    }

    if (props.installPrometheusNodeExporter === false) {
      setPath(values, "prometheus.nodeExporter.enabled", false);
      setPath(values, "prometheus.serviceAccounts.nodeExporter.create", false);
    }

    const kubecostHelmChart = clusterInfo.cluster.addHelmChart("kubecost", {
      chart: props.chart ? props.chart : "cost-analyzer",
      release: props.release,
      repository: props.repository,
      namespace: props.namespace,
      version: props.version,
      values,
    });
    return Promise.resolve(kubecostHelmChart);
  }
}
