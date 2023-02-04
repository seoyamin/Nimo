import Axios from "axios";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  Text,
  StatusBar
} from "react-native";
import baseURL from "../../baseURL";
import CommonStyle from "../../common/common_style";
import SimulMainStyle from "../../simul_main/simul_main_style";
import ExitBtn from "../../common/exit_btn";
import NavigateBtn from "../../simul_common/navigate_btn";
import MessageCard from "../messageCard";
import SimulMsgStyle from "./simul_message_style";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface MsgContent {
  simulNum: number;
  title: string;
  commentary: string;
  done: string;
}

const MessageSimul = ({ navigation }: any) => {
  const [simulList, setSimulList] = useState<MsgContent[]>([]);

  useEffect(() => {
    fetchSimulMsg();
  }, []);

  const fetchSimulMsg = async () => {
    try {
      const token = await AsyncStorage.getItem("user_Token");
      Axios.get(baseURL + "/simulation/msg", {
        headers: {
          accessToken: `${token}`,
        },
      }).then((res) => {
        setSimulList(res.data);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleOnPress = (simulNum: number, title: string) => {
    navigation.navigate("MessageDetail", {
      simulNum: simulNum,
      title: title,
    });
  };

  return (
    <SafeAreaView style={CommonStyle.container}>
      <StatusBar barStyle={"light-content"} backgroundColor="#00284E" />
      <Image
        source={require("../../../assets/icons/simul_message/msg_bg_white.png")}
        style={SimulMainStyle.img_galaxy}
      />

      <View style={SimulMsgStyle.phone_div}>
        <View style={SimulMsgStyle.message_div}>
          <View style={SimulMsgStyle.message_div_title}>
            <Text style={SimulMsgStyle.text_title}>메시지</Text>
            <Image
              source={require("../../../assets/icons/simul_message/ic_msg.png")}
              style={SimulMsgStyle.ic_msg}
              resizeMode="contain"
            />
          </View>
          <ScrollView>
            <View style={SimulMsgStyle.msg_card_div}>
              {simulList?.map(({ simulNum, title, commentary, done }) => (
                <TouchableOpacity
                  onPress={() => handleOnPress(simulNum, title)}
                >
                  <MessageCard key={simulNum} title={title} done={done} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <NavigateBtn navigation={navigation} />
      </View>
      <ExitBtn navigation={navigation} content={"피싱 체험 나가기"} />
    </SafeAreaView>
  );
};

export default MessageSimul;
