import Cover from '@/renderer/components/Cover'
import Skeleton from '@/renderer/components/Skeleton'
import SvgIcon from '@/renderer/components/SvgIcon'
import { prefetchAlbum } from '@/renderer/hooks/useAlbum'
import { prefetchPlaylist } from '@/renderer/hooks/usePlaylist'
import { formatDate, resizeImage, scrollToTop } from '@/renderer/utils/common'
import { TrackListSource, TrackListSourceType } from '@/renderer/utils/player'

export enum Subtitle {
  Copywriter = 'copywriter',
  Creator = 'creator',
  TypeReleaseYear = 'type+releaseYear',
  Artist = 'artist',
}

const Title = ({
  title,
  seeMoreLink,
}: {
  title: string
  seeMoreLink: string
}) => {
  return (
    <div className='flex items-baseline justify-between'>
      <div className='my-4 text-[28px] font-bold text-black dark:text-white'>
        {title}
      </div>
      {seeMoreLink && (
        <div className='text-13px font-semibold text-gray-600 hover:underline'>
          See More
        </div>
      )}
    </div>
  )
}

const getSubtitleText = (
  item: Album | Playlist | Artist,
  subtitle: Subtitle
) => {
  const nickname = 'creator' in item ? item.creator.nickname : 'someone'
  const artist =
    'artist' in item
      ? item.artist.name
      : 'artists' in item
        ? item.artists?.[0]?.name
        : 'unknown'
  const copywriter = 'copywriter' in item ? item.copywriter : 'unknown'
  const releaseYear =
    ('publishTime' in item &&
      formatDate(item.publishTime ?? 0, 'en', 'YYYY')) ||
    'unknown'

  const type = {
    playlist: 'playlist',
    album: 'Album',
    专辑: 'Album',
    Single: 'Single',
    'EP/Single': 'EP',
    EP: 'EP',
    unknown: 'unknown',
    精选集: 'Collection',
  }[('type' in item && typeof item.type !== 'number' && item.type) || 'unknown']

  const table = {
    [Subtitle.Creator]: `by ${nickname}`,
    [Subtitle.TypeReleaseYear]: `${type} · ${releaseYear}`,
    [Subtitle.Artist]: artist,
    [Subtitle.Copywriter]: copywriter,
  }

  return table[subtitle]
}

const getImageUrl = (item: Album | Playlist | Artist) => {
  let cover: string | undefined = ''
  if ('coverImgUrl' in item) cover = item.coverImgUrl
  if ('picUrl' in item) cover = item.picUrl
  if ('img1v1Url' in item) cover = item.img1v1Url
  return resizeImage(cover || '', 'md')
}

const CoverRow = ({
  title,
  albums,
  artists,
  playlists,
  subtitle = Subtitle.Copywriter,
  seeMoreLink,
  isSkeleton,
  className,
  rows = 2,
  navigateCallback, // Callback function when click on the cover/title
}: {
  title?: string
  albums?: Album[]
  artists?: Artist[]
  playlists?: Playlist[]
  subtitle?: Subtitle
  seeMoreLink?: string
  isSkeleton?: boolean
  className?: string
  rows?: number
  navigateCallback?: () => void
}) => {
  const renderItems = useMemo(() => {
    if (isSkeleton) {
      return new Array(rows * 5).fill({}) as Array<Album | Playlist | Artist>
    }
    return albums ?? playlists ?? artists ?? []
  }, [albums, artists, isSkeleton, playlists, rows])

  const navigate = useNavigate()
  const goTo = (id: number) => {
    if (isSkeleton) return
    if (albums) navigate(`/album/${id}`)
    if (playlists) navigate(`/playlist/${id}`)
    if (artists) navigate(`/artist/${id}`)
    if (navigateCallback) navigateCallback()
    scrollToTop()
  }

  const prefetch = (id: number) => {
    if (albums) prefetchAlbum({ id })
    if (playlists) prefetchPlaylist({ id })
  }

  const getCoverInfo = (id: number): TrackListSource | undefined => {
    if (albums) return { type: TrackListSourceType.Album, id }
    if (playlists) return { type: TrackListSourceType.Playlist, id }
    return undefined
  }


  return (
    <div>
      {title && <Title title={title} seeMoreLink={seeMoreLink ?? ''} />}

      <div
        className={classNames(
          'grid',
          className,
          !className &&
          'grid-cols-3 gap-x-6 gap-y-7 lg:grid-cols-4  xl:grid-cols-5 2xl:grid-cols-6'
        )}
      >
        {renderItems.map((item, index) => (
          <div
            key={item.id ?? index}
            onMouseOver={() => prefetch(item.id)}
            className='grid gap-x-6 gap-y-7'
          >
            <div>
              {/*  Cover  */}
              {isSkeleton ? (
                <Skeleton className='box-content aspect-square w-full rounded-xl border border-black border-opacity-0' />
              ) : (
                <Cover
                  onClick={() => goTo(item.id)}
                  imageUrl={getImageUrl(item)}
                  coverInfo={getCoverInfo(item.id)}
                  roundedClass={artists ? 'rounded-full' : 'rounded-xl'}
                />
              )}

              {/* Info */}
              <div className='mt-2'>
                <div className='font-semibold'>
                  {/*  Name */}
                  {isSkeleton ? (
                    <div className='flex w-full -translate-y-px flex-col'>
                      <Skeleton className='w-full leading-tight'>
                        PLACEHOLDER
                      </Skeleton>
                      <Skeleton className='w-1/3 translate-y-px leading-tight'>
                        PLACEHOLDER
                      </Skeleton>
                    </div>
                  ) : (
                    <span
                      className={classNames(
                        'line-clamp-2 leading-tight',
                        artists && 'mt-3 text-center'
                      )}
                    >
                      {/* Playlist private icon */}
                      {(item as Playlist).privacy === 10 && (
                        <SvgIcon
                          name='lock'
                          className='mr-1 mb-1 inline-block h-3 w-3 text-gray-300'
                        />
                      )}

                      {/* Explicit icon */}
                      {(item as Album)?.mark === 1056768 && (
                        <SvgIcon
                          name='explicit'
                          className='float-right mt-[2px] h-4 w-4 text-gray-300'
                        />
                      )}

                      {/* Name */}
                      <span
                        onClick={() => goTo(item.id)}
                        className='decoration-gray-600 decoration-2 hover:underline dark:text-white dark:decoration-gray-200'
                      >
                        {item.name}
                      </span>
                    </span>
                  )}
                </div>

                {/* Subtitle */}
                {isSkeleton ? (
                  <Skeleton className='w-3/5 translate-y-px text-[12px]'>
                    PLACEHOLDER
                  </Skeleton>
                ) : (
                  !artists && (
                    <div className='flex text-[12px] text-gray-500 dark:text-gray-400'>
                      <span>{getSubtitleText(item, subtitle)}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CoverRow
