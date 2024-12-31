import type { LabelerServer } from "@skyware/labeler";

interface Label {
  /** The AT Protocol version of the label object. */
  ver?: number;
  /** DID of the actor who created this label. */
  src: string;
  /** AT URI of the record, repository (account), or other resource that this label applies to. */
  uri: string;
  /** Optionally, CID specifying the specific version of 'uri' resource this label applies to. */
  cid?: string;
  /** The short string name of the value or type of this label. */
  val: string;
  /** If true, this is a negation label, overwriting a previous label. */
  neg?: boolean;
  /** Timestamp when this label was created. */
  cts: string;
  /** Timestamp at which this label expires (no longer applies). */
  exp?: string;
  /** Signature of dag-cbor encoded label. */
  sig?: Uint8Array;
  [k: string]: unknown;
}

export function fetchCurrentLabels(labelerServer: LabelerServer, did: string) {
  const query = labelerServer.db
    .prepare<string[]>(`SELECT * FROM labels WHERE uri = ?`)
    .all(did) as Label[];

  const currentLabels = new Set<string>();
  for (const queryLabel of query) {
    if (!queryLabel.neg) currentLabels.add(queryLabel.val);
    else currentLabels.delete(queryLabel.val);
  }

  if (currentLabels.size > 0) {
    console.log(`Current labels: ${Array.from(currentLabels).join(", ")}`);
  }

  return currentLabels;
}
