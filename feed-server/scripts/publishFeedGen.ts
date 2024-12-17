import dotenv from 'dotenv'
import inquirer from 'inquirer'
import { AtpAgent, BlobRef } from '@atproto/api'
import fs from 'fs/promises'
import { ids } from '../src/lexicon/lexicons'
import labelsData from "../../labels";

const run = async () => {
  dotenv.config()

  if (!process.env.FEEDGEN_SERVICE_DID && !process.env.FEEDGEN_HOSTNAME) {
    throw new Error('Please provide a hostname in the .env file')
  }

  const answers = await inquirer
    .prompt([
      {
        type: 'input',
        name: 'handle',
        message: 'Enter your Bluesky handle:',
        required: true,
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter your Bluesky password (preferably an App Password):',
      },
      {
        type: 'input',
        name: 'service',
        message: 'Optionally, enter a custom PDS service to sign in with:',
        default: 'https://bsky.social',
        required: false,
      },
    ])

  const { handle, password, service } = answers

  const feedGenDid =
    process.env.FEEDGEN_SERVICE_DID ?? `did:web:${process.env.FEEDGEN_HOSTNAME}`

  // only update this if in a test environment
  const agent = new AtpAgent({ service: service ? service : 'https://bsky.social' })
  await agent.login({ identifier: handle, password})

  // let avatarRef: BlobRef | undefined
  // if (avatar) {
  //   let encoding: string
  //   if (avatar.endsWith('png')) {
  //     encoding = 'image/png'
  //   } else if (avatar.endsWith('jpg') || avatar.endsWith('jpeg')) {
  //     encoding = 'image/jpeg'
  //   } else {
  //     throw new Error('expected png or jpeg')
  //   }
  //   const img = await fs.readFile(avatar)
  //   const blobRes = await agent.api.com.atproto.repo.uploadBlob(img, {
  //     encoding,
  //   })
  //   avatarRef = blobRes.data.blob
  // }

  for (const label of labelsData.labels) {
  await agent.api.com.atproto.repo.putRecord({
    repo: agent.session?.did ?? '',
    collection: ids.AppBskyFeedGenerator,
    rkey: label.value,
    record: {
      did: feedGenDid,
      displayName: label.displayName,
      description: `A feed to display fanworks labeled as ${label.displayName}`,
      // avatar: avatarRef,
      createdAt: new Date().toISOString(),
    },
  })

  console.log(`Created feed for ${label.displayName} 🎉`);
}

console.log('All done 🎉');

}


run()
