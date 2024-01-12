import { CommentCard, commentApi } from '~entities/comment';
import { sessionModel } from '~entities/session';
import { DeleteCommentIconButtton } from '~features/comment';
import { Spinner } from '~shared/ui/spinner';

type CommentsListProps = {
  slug: string;
};

export function CommentsList(props: CommentsListProps) {
  const { slug } = props;

  const isAuth = sessionModel.useAuth();

  const {
    data: comments,
    isPending,
    // isError,
    // error,
  } = commentApi.useCommentsQuery(slug, {
    secure: isAuth,
  });

  if (isPending)
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Spinner />
      </div>
    );

  // if (isError) return <ErrorHandler error={error} />;

  return (
    <div>
      {comments!.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          actions={<DeleteCommentIconButtton slug={slug} id={comment.id} />}
        />
      ))}
    </div>
  );
}
