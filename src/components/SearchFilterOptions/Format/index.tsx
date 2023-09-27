import {View, Text, FlatList} from 'react-native';
import React from 'react';
import {MediaFormats} from '../../../utils/constants';
import {MediaFormat} from '../../../@types';
import {PillComponent} from '../../Shared';

const Format = () => {
  const renderItem = (item: MediaFormat) => {
    return <PillComponent title={item.replaceAll('_', ' ')} active={false} />;
  };

  return (
    <View>
      <FlatList
        data={MediaFormats}
        renderItem={({item}) => renderItem(item)}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => `filter-format-${item}`}
        contentContainerStyle={{gap: 10}}
      />
    </View>
  );
};

export default Format;
