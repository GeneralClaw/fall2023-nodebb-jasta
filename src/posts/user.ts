import async from 'async';
import validator from 'validator';
import _ from 'lodash';

import db from '../database';
import user from '../user';
import topics from '../topics';
import groups from '../groups';
import meta from '../meta';
import plugins from '../plugins';
import privileges from '../privileges';

interface PostsObject {
    getUserInfoForPosts: (uids: number[], uid: number) => Promise<number[]>;
    overrideGuestHandle: (postData: PostData, handle: boolean) => void;
    isOwner: (pids: number[], uid: string) => Promise<boolean[] | boolean>;
    getPostsFields(pids: number[] | number, fields: string[]): Promise<PostData[]>;
    getCidsByPids: (pids: number[]) => Promise<number[]>;
    isModerator: (pids: number[], uid: string) => Promise<boolean[] | boolean>;
    changeOwner: (pids: number[], toUid: string) => Promise<PostData[]>;
    parseSignature: (userData: UserData, uid: number) => Promise<ParseSignatureResult>
}

interface PostData{
    user: UserData;
    uid: string;
    isAnonymous: boolean;
    pid: number;
    cid: number;
    votes: number;
    timestamp: number;
    tid: string;
}

interface UserData {
    signature: string;
    fullname: string;
    selectedGroups: Group[];
    groupTitleArray: string[];
    custom_profile_info: string[];
    uid: number;
    username: string;
    displayname: string;
}

interface UserSettings {
    showfullname: boolean;
}

interface ParseSignatureResult {
    userData: UserData;
}

interface Group {
    userTitleEnabled: boolean;
    hidden: boolean;
    name: string;
    slug: string;
    labelColor: string;
    textColor: string;
    icon: string;
    userTitle: string;
}

interface ProfileInfo {
    profile: string[]
}

interface TopicData {
    tid: number;
    cid: number;
    deleted: boolean;
    title: string;
    uid: number;
    mainPid: number;
    timestamp: number;
}

interface UserFieldsRes {
    fields: string[]
    uids: number[]
}

interface UserInfoRes {
    users: number[]
}

export = function (Posts: PostsObject) {
    async function getUserData(uids: number[], uid: number): Promise<UserData[]> {
        const fields = [
            'uid', 'username', 'fullname', 'userslug',
            'reputation', 'postcount', 'topiccount', 'picture',
            'signature', 'banned', 'banned:expire', 'status',
            'lastonline', 'groupTitle', 'mutedUntil',
        ];

        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const result = await plugins.hooks.fire('filter:posts.addUserFields', {
            fields: fields,
            uid: uid,
            uids: uids,
        }) as UserFieldsRes;

        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        return await user.getUsersFields(result.uids, _.uniq(result.fields)) as UserData[];
    }

    async function getGroupsMap(userData: UserData[]) {
        const groupTitles = _.uniq(_.flatten(userData.map(u => u && u.groupTitleArray)));
        const groupsMap: _.Dictionary<Group> = {};

        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const groupsData = await groups.getGroupsData(groupTitles) as Group[];
        groupsData.forEach((group) => {
            if (group && group.userTitleEnabled && !group.hidden) {
                groupsMap[group.name] = {
                    name: group.name,
                    slug: group.slug,
                    labelColor: group.labelColor,
                    textColor: group.textColor,
                    icon: group.icon,
                    userTitle: group.userTitle,
                    userTitleEnabled: group.userTitleEnabled,
                    hidden: group.hidden,
                };
            }
        });
        return groupsMap;
    }

    async function checkGroupMembership(uid: number, groupTitleArray: string[]): Promise<boolean[]> {
        if (!Array.isArray(groupTitleArray) || !groupTitleArray.length) {
            return null;
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        return await groups.isMemberOfGroups(uid, groupTitleArray) as boolean[];
    }

    async function parseSignature(userData: UserData, uid: number, signatureUids: Set<number>): Promise<string> {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        if (!userData.signature || !signatureUids.has(userData.uid) || meta.config.disableSignatures) {
            return '';
        }
        const result = await Posts.parseSignature(userData, uid);
        return result.userData.signature;
    }

    async function reduceTopicCounts(postsByUser: _.Dictionary<PostData[]>) {
        await async.eachSeries(Object.keys(postsByUser), async (uid) => {
            const posts: PostData[] = postsByUser[uid];
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            const exists = await user.exists(uid) as boolean;
            if (exists) {
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                await user.incrementUserFieldBy(uid, 'topiccount', -posts.length);
            }
        });
    }

    async function reduceCounters(postsByUser: _.Dictionary<PostData[]>): Promise<void> {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await async.eachOfSeries(postsByUser, async (posts: PostData[], uid: number) => {
            const repChange = posts.reduce((acc, val) => acc + val.votes, 0);
            await Promise.all([
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                user.updatePostCount(uid),
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                user.incrementUserReputationBy(uid, -repChange),
            ]);
        });
    }

    async function updateTopicPosters(postData: PostData[], toUid: string): Promise<void> {
        const postsByTopic = _.groupBy(postData, p => parseInt(p.tid, 10));
        await async.eachOf(postsByTopic, async (posts, tid) => {
            const postsByUser = _.groupBy(posts, p => parseInt(p.uid, 10));
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await db.sortedSetIncrBy(`tid:${tid}:posters`, posts.length, toUid);
            await async.eachOf(postsByUser, async (posts, uid) => {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                await db.sortedSetIncrBy(`tid:${tid}:posters`, -posts.length, uid);
            });
        });
    }

    async function handleMainPidOwnerChange(postData: PostData[], toUid: string) {
        const tids = _.uniq(postData.map(p => p.tid));
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const topicData = await topics.getTopicsFields(tids, [
            'tid', 'cid', 'deleted', 'title', 'uid', 'mainPid', 'timestamp',
        ]) as TopicData[];

        const tidToTopic = _.zipObject(tids, topicData);

        const mainPosts = postData.filter(p => p.pid === tidToTopic[p.tid].mainPid);
        if (!mainPosts.length) {
            return;
        }

        const bulkAdd = [];
        const bulkRemove = [];
        const postsByUser: _.Dictionary<PostData[]> = {};
        mainPosts.forEach((post) => {
            bulkRemove.push([`cid:${post.cid}:uid:${post.uid}:tids`, post.tid]);
            bulkRemove.push([`uid:${post.uid}:topics`, post.tid]);

            bulkAdd.push([`cid:${post.cid}:uid:${toUid}:tids`, tidToTopic[post.tid].timestamp, post.tid]);
            bulkAdd.push([`uid:${toUid}:topics`, tidToTopic[post.tid].timestamp, post.tid]);
            postsByUser[post.uid] = postsByUser[post.uid] || [];
            postsByUser[post.uid].push(post);
        });

        await Promise.all([
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            db.setObjectField(mainPosts.map(p => `topic:${p.tid}`), 'uid', toUid),
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            db.sortedSetRemoveBulk(bulkRemove),
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            db.sortedSetAddBulk(bulkAdd),
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            user.incrementUserFieldBy(toUid, 'topiccount', mainPosts.length),
            reduceTopicCounts(postsByUser),
        ]);

        const changedTopics = mainPosts.map(p => tidToTopic[p.tid]);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await plugins.hooks.fire('action:topic.changeOwner', {
            topics: _.cloneDeep(changedTopics),
            toUid: toUid,
        });
    }

    Posts.getUserInfoForPosts = async function (uids, uid) {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const [userData, userSettings, signatureUids] = await Promise.all([
            getUserData(uids, uid),
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            user.getMultipleUserSettings(uids),
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            privileges.global.filterUids('signature', uids),
        ]) as [UserData[], UserSettings[], string[]];

        const uidsSignatureSet = new Set(signatureUids.map(uid => parseInt(uid, 10)));
        const groupsMap = await getGroupsMap(userData);

        userData.forEach((userData, index) => {
            userData.signature = validator.escape(String(userData.signature || ''));
            userData.fullname = userSettings[index].showfullname ? validator.escape(String(userData.fullname || '')) : undefined;
            userData.selectedGroups = [];

            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            if (meta.config.hideFullname) {
                userData.fullname = undefined;
            }
        });

        const result = await Promise.all(userData.map(async (userData) => {
            const [isMemberOfGroups, signature, customProfileInfo] = await Promise.all([
                checkGroupMembership(userData.uid, userData.groupTitleArray),
                parseSignature(userData, uid, uidsSignatureSet),
                plugins.hooks.fire('filter:posts.custom_profile_info', { profile: [], uid: userData.uid }),
            ]) as [boolean[], string, ProfileInfo];

            if (isMemberOfGroups && userData.groupTitleArray) {
                userData.groupTitleArray.forEach((userGroup, index) => {
                    if (isMemberOfGroups[index] && groupsMap[userGroup]) {
                        userData.selectedGroups.push(groupsMap[userGroup]);
                    }
                });
            }
            userData.signature = signature;
            userData.custom_profile_info = customProfileInfo.profile;
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            return await plugins.hooks.fire('filter:posts.modifyUserInfo', userData) as number[];
        }));

        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const hookResult = await plugins.hooks.fire('filter:posts.getUserInfoForPosts', { users: result }) as UserInfoRes;

        return hookResult.users;
    };

    Posts.overrideGuestHandle = function (postData, handle) {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        if (meta.config.allowGuestHandles && postData && postData.user && parseInt(postData.uid, 10) === 0 && handle) {
            postData.user.username = validator.escape(String(handle));
            if (postData.user.hasOwnProperty('fullname')) {
                postData.user.fullname = postData.user.username;
            }

            if (postData.isAnonymous) {
                postData.user.displayname = 'anonymous';
            } else {
                postData.user.displayname = postData.user.username;
            }
        }
    };

    Posts.isModerator = async function (pids, uid) {
        if (parseInt(uid, 10) <= 0) {
            return (pids).map(() => false);
        }
        const cids = await Posts.getCidsByPids(pids);
        return await user.isModerator(uid, cids) as Promise<boolean[] | boolean>;
    };

    Posts.changeOwner = async function (pids, toUid) {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const exists = await user.exists(toUid) as boolean;
        if (!exists) {
            throw new Error('[[error:no-user]]');
        }
        let postData = await Posts.getPostsFields(pids, [
            'pid', 'tid', 'uid', 'content', 'deleted', 'timestamp', 'upvotes', 'downvotes',
        ]);
        postData = postData.filter(p => p.pid && parseInt(p.uid, 10) !== parseInt(toUid, 10));
        pids = postData.map(p => p.pid);

        const cids = await Posts.getCidsByPids(pids);

        const bulkRemove: (string|number)[][] = [];
        const bulkAdd: (string|number)[][] = [];
        let repChange = 0;
        const postsByUser: _.Dictionary<PostData[]> = {};
        postData.forEach((post, i) => {
            post.cid = cids[i];
            repChange += post.votes;
            bulkRemove.push([`uid:${post.uid}:posts`, post.pid]);
            bulkRemove.push([`cid:${post.cid}:uid:${post.uid}:pids`, post.pid]);
            bulkRemove.push([`cid:${post.cid}:uid:${post.uid}:pids:votes`, post.pid]);

            bulkAdd.push([`uid:${toUid}:posts`, post.timestamp, post.pid]);
            bulkAdd.push([`cid:${post.cid}:uid:${toUid}:pids`, post.timestamp, post.pid]);
            if (post.votes > 0 || post.votes < 0) {
                bulkAdd.push([`cid:${post.cid}:uid:${toUid}:pids:votes`, post.votes, post.pid]);
            }
            postsByUser[post.uid] = postsByUser[post.uid] || [];
            postsByUser[post.uid].push(post);
        });

        await Promise.all([
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            db.setObjectField(pids.map(pid => `post:${pid}`), 'uid', toUid),
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            db.sortedSetRemoveBulk(bulkRemove),
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            db.sortedSetAddBulk(bulkAdd),
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            user.incrementUserReputationBy(toUid, repChange),
            handleMainPidOwnerChange(postData, toUid),
            updateTopicPosters(postData, toUid),
        ]);

        await Promise.all([
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            user.updatePostCount(toUid),
            reduceCounters(postsByUser),
        ]);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await plugins.hooks.fire('action:post.changeOwner', {
            posts: _.cloneDeep(postData),
            toUid: toUid,
        });
        return postData;
    };
};
