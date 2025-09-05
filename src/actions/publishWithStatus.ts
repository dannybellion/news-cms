import {DocumentActionComponent} from 'sanity'

export const publishWithStatusAction: DocumentActionComponent = (props) => {
  const {id, draft, onComplete, client} = props

  return {
    label: 'Publish',
    icon: () => '🚀',
    onHandle: async () => {
      if (!draft) return

      // Publish the document with status updated
      await client.transaction()
        .create({_id: id, _type: draft._type, ...draft, status: 'published'})
        .delete(`drafts.${id}`)
        .commit()
      
      onComplete()
    }
  }
}