import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {QueryAnime, RootStackParamList, SubOrDub} from '../../@types';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Info} from '../../components';
import {DescriptionComponent} from '../../components/Shared';
import {ScrollView} from '../../styles/sharedStyles';
import {CollectionsModal, EpisodesModal} from '../../modals';
import {API_BASE} from '@env';
import {api, helpers} from '../../utils';
import {useQuery} from '@tanstack/react-query';
import {InfoPageSkeleton} from '../../components/Skeletons';
import CharacterContainer from '../../containers/CastContainer';
import {CWWrapper, Wrapper} from './InfoScreen.styles';
import {
  SettingsContext,
  useAccessToken,
  useSettingsContext,
} from '../../contexts';
import {Anilist} from '@tdanks2000/anilist-wrapper';
import {CardContainer, ChangeSourceProvider} from '../../containers';
import {useBreakpoints} from '../../hooks';

type Props = NativeStackScreenProps<RootStackParamList, 'Info'>;

const InfoScreen = ({route}: Props) => {
  const {sourceProvider, preferedVoice} = React.useContext(SettingsContext);

  const {isMobile} = useBreakpoints();
  const {accessToken} = useAccessToken();
  const anilist = new Anilist(accessToken);
  const navigate: any = useNavigation();
  const {id} = route.params;

  const [showEpisodesModal, setShowEpisodesModal] = React.useState(false);
  const [showTrailerModal, setShowTrailerModal] = React.useState(false);

  const [dubOrSub, setDubOrSub] = React.useState<SubOrDub>(
    preferedVoice as SubOrDub,
  );

  useFocusEffect(
    React.useCallback(() => {
      if (!id) return navigate.navigate('Home');

      setDubOrSub(helpers.getSubOrDub());
    }, []),
  );

  const fetcher = async () => {
    const mediaStatus = (await anilist.media.anime(Number(id))) as any;

    const animeData = await api.fetcher(
      `${API_BASE}/anilist/info/${id}?dub=${
        dubOrSub === 'dub'
      }&provider=${sourceProvider}`,
    );

    const mediaListStatus = mediaStatus?.data?.Media?.mediaListEntry;

    const returnData = {
      mediaStatus: mediaListStatus,
      animeData: animeData,
    };

    return returnData;
  };

  const {
    isPending,
    isError,
    data: resData,
    error,
  }: QueryAnime = useQuery({
    queryKey: ['info', id, dubOrSub, sourceProvider],
    queryFn: fetcher,
  });

  if (isPending) return <InfoPageSkeleton />;

  const data = resData?.animeData;
  const mediaListStatus = resData?.mediaStatus;

  if (!data) return <InfoPageSkeleton />;

  const findNextEpisode = (
    episodes: any[],
    howManyEpisodesForward: number,
    returnLastEpisodeIfFin?: boolean,
  ) => {
    const nextEpisodeNumber =
      (mediaListStatus?.progress || 0) + howManyEpisodesForward;

    if (episodes?.length <= 0) return undefined;

    if (
      mediaListStatus?.status === 'COMPLETED' ||
      (nextEpisodeNumber >= episodes?.length && returnLastEpisodeIfFin)
    ) {
      return returnLastEpisodeIfFin
        ? episodes[episodes?.length - 1]
        : undefined;
    }

    if (!returnLastEpisodeIfFin && nextEpisodeNumber >= episodes.length) {
      return undefined;
    }

    return (
      episodes.find(episode => episode.number === nextEpisodeNumber) ||
      episodes[0]
    );
  };

  const nextEpisode = findNextEpisode(data.episodes, 1, false);
  const nextNextEpisode = findNextEpisode(data.episodes, 2, false);

  return (
    <SafeAreaView>
      <ScrollView>
        <Info.Top
          title={data.title}
          episode_title={nextEpisode ? nextEpisode.title : undefined}
          rating={data.rating}
          poster_image={nextEpisode?.image ? nextEpisode.image : data.cover}
          key={`info-top-${data.id}`}
          dubOrSub={dubOrSub ?? 'sub'}
          setDubOrSub={setDubOrSub}
        />
        {!nextEpisode ? null : (
          <Info.ContinueWatching
            animeData={data}
            animeId={Number(data.id)}
            currentEpisode={nextEpisode?.number ?? 1}
            currentEpisodeData={nextEpisode ?? {}}
            nextEpisodeData={nextNextEpisode ?? {}}
            nextEpisodeNumber={nextNextEpisode?.number ?? 1}
            episodes={data.episodes}
          />
        )}
        <Info.Options
          openEpisodesModal={() => setShowEpisodesModal(true)}
          episodeLegth={data?.episodes?.length ?? 0}
          anime_info={data}
        />
        <Info.MetaInfo
          type={'ANIME'}
          data={data}
          key={`info-meta-info-${data.id}`}
        />
        <DescriptionComponent description={data.description} />
        <Wrapper>
          <CharacterContainer
            type="ANIME"
            characters={data.characters}
            subOrDub={dubOrSub}
          />
        </Wrapper>
        {data?.relations.length > 0 ? (
          <Wrapper>
            <CardContainer title="Related" data={data?.relations} />
          </Wrapper>
        ) : null}
        {data?.recommendations.length > 0 ? (
          <Wrapper>
            <CardContainer
              title="You may also like"
              data={data?.recommendations}
            />
          </Wrapper>
        ) : null}
      </ScrollView>
      <EpisodesModal
        episodes={data.episodes}
        visible={showEpisodesModal}
        setVisible={setShowEpisodesModal}
        anime_info={{
          id: data.id,
          title: data.title,
          malId: data.malId,
          image: data.cover ?? data.image,
        }}
      />
      {/* <CollectionsModal /> */}
    </SafeAreaView>
  );
};

export default InfoScreen;
