import {View, Text} from 'react-native';
import React from 'react';
import {
  BackButton,
  BackButtonIcon,
  BottomBottomContainer,
  BottomContainer,
  Container,
  ImageBackground,
  SeasonText,
  TitleText,
  TopContainer,
  Wrapper,
} from './InfoTop.styles';
import {Option, RatingComponent, WatchNowComponent} from '../../Shared';
import {useNavigation} from '@react-navigation/native';
import {ITitleLanguageOptions, SubOrDub} from '../../../@types';
import {helpers, settingsHelper, utils} from '../../../utils';
import {SettingsContext} from '../../../contexts';

interface Props {
  rating: number;
  title: string | ITitleLanguageOptions;
  episode_title?: string;
  poster_image: string;
  dubOrSub: string;
  setDubOrSub: (dubOrSub: SubOrDub) => void;
}

const Top = ({
  rating,
  title,
  poster_image,
  setDubOrSub,
  dubOrSub,
  episode_title,
}: Props) => {
  const actualTitle = utils.getTitle(title);

  const {changePreferedVoice, preferedVoice} =
    React.useContext(SettingsContext);

  const navigation = useNavigation();

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <Container>
      <ImageBackground
        source={{
          uri: poster_image,
        }}>
        {/* @ts-ignore */}
        <Wrapper>
          <TopContainer>
            <BackButton onPress={goBack}>
              <BackButtonIcon name="arrow-left" />
            </BackButton>
            <RatingComponent rating={rating} />
          </TopContainer>
          <BottomContainer>
            {/* <SeasonText>Season 1</SeasonText> */}
            <TitleText numberOfLines={2}>
              {actualTitle && !episode_title
                ? actualTitle
                : `${actualTitle} - ${episode_title}`}
            </TitleText>
            <BottomBottomContainer>
              <WatchNowComponent WatchText="Watch trailer" />
              <Option
                option={preferedVoice as string}
                options={[
                  {label: 'SUB', value: 'sub'},
                  {label: 'DUB', value: 'dub'},
                ]}
                setOption={(value: string) => setDubOrSub(value as SubOrDub)}
                onPress={(value: string) =>
                  changePreferedVoice ? changePreferedVoice() : null
                }
              />
            </BottomBottomContainer>
          </BottomContainer>
        </Wrapper>
      </ImageBackground>
    </Container>
  );
};

export default Top;
