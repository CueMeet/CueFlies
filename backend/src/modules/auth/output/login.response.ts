import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserData {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  avatar: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  accessToken: string;

  @Field(() => UserData)
  user: UserData;
}
