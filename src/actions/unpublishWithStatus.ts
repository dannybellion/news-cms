import {DocumentActionComponent} from 'sanity'

export const unpublishWithStatusAction: DocumentActionComponent = (props) => {
  const {id, published, onComplete, client} = props

  return {
    label: 'Unpublish',
    icon: () => '📝',
    onHandle: async () => {
      if (!published) return

      // Unpublish the document (move to drafts with status draft)
      await client.transaction()
        .create({_id: `drafts.${id}`, _type: published._type, ...published, status: 'draft'})
        .delete(id)
        .commit()
      
      onComplete()
    }
  }
}