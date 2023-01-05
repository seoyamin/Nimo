import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
const SCREEN_WIDTH = Dimensions.get("window").width;

export interface CommunityCardProps {
  contents: string;
  date: string;
  id: number;
  tag: string;
  title: string;
  user_nickname: string;
  navigation: any;
}

const CommunityCard = (props: CommunityCardProps) => {
  const { contents, date, id, tag, title, user_nickname, navigation } = props;
  const [userTime, setUserTime] = useState<string | number>("");
  const [previewContent, setPreviewContent] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    const then = new Date(date);

    const diffMSec = now.getTime() - then.getTime();
    const diffMin = Math.floor(diffMSec / (60 * 1000));
    if (diffMin < 60) {
      setUserTime(`${diffMin}분 전`);
    } else if (diffMin >= 60 && diffMin < 60 * 24) {
      setUserTime(`${diffMin / 60}시간 전`);
    } else {
      setUserTime(date.substring(0, 10));
    }
  }, [date]);

  useEffect(() => {
    contents.length < 20
      ? setPreviewContent(contents)
      : setPreviewContent(`${contents.slice(0, 20)}...`);
  }, [contents]);

  return (
    <>
      <View style={styles.card_container}>
        <View style={styles.card_header}>
          <Image
            source={require("../../../assets/icons/community/community_profile.png")}
            style={styles.img_profile}
          />
          <Text style={styles.text_nickname}>{user_nickname}</Text>
          <Text style={styles.text_time}>{userTime}</Text>
        </View>
      </View>
      <View style={styles.contents_wrapper}>
        <Text style={styles.text_contents}>{previewContent}</Text>
      </View>
      <View style={styles.lineStyle} />
    </>
  );
};

const styles = StyleSheet.create({
  card_container: {
    flexDirection: "row",
    width: SCREEN_WIDTH - 80,
  },
  card_header: {
    flexDirection: "row",
    flex: 2,
    position: "relative",
  },
  img_profile: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  text_nickname: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "700",
  },
  text_time: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "400",
    float: "right",
    position: "absolute",
    marginLeft: SCREEN_WIDTH / 2 + 60,
  },
  text_contents: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "400",
  },
  contents_wrapper: {
    marginTop: 10,
    marginLeft: 40,
    height: 30,
  },
  lineStyle: {
    marginTop: 10,
    borderWidth: 0.5,
    borderColor: "gray",
    marginBottom: 20,
  },
});

export default CommunityCard;
